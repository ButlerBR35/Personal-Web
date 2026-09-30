"""Google 相簿 ZIP 匯入工具。需 Python 3 與 Pillow。"""
import sys,json,re,hashlib,zipfile,io,os,shutil,tempfile
from pathlib import Path,PurePosixPath
from datetime import datetime
from PIL import Image,ImageOps
BASE=Path(__file__).resolve().parent

def run(filename):
 stage=Path(tempfile.mkdtemp(prefix='album-import-',dir=BASE))
 try:
  albums={}
  with zipfile.ZipFile(filename) as z:
   files=[i for i in z.infolist() if not i.is_dir() and PurePosixPath(i.filename).suffix.lower() in ('.jpg','.jpeg','.png','.webp') and '__MACOSX' not in i.filename]
   if not files: raise ValueError('ZIP 沒有 JPG、PNG 或 WebP 圖片。')
   if sum(i.file_size for i in files)>8_000_000_000: raise ValueError('照片總大小超過 8 GB。')
   def natural(i): return [int(v) if v.isdigit() else v.lower() for v in re.split(r'(\d+)',i.filename)]
   for n,item in enumerate(sorted(files,key=natural)):
    parent=PurePosixPath(item.filename).parent
    name=parent.name if str(parent)!='.' else Path(filename).stem
    key=str(parent)
    aid=hashlib.sha256(key.encode()).hexdigest()[:16]
    album=albums.setdefault(key,{'id':aid,'name':name,'photos':[]})
    if item.file_size>100_000_000: raise ValueError('單張照片超過 100 MB：'+item.filename)
    raw=z.read(item)
    pid=hashlib.sha256(item.filename.encode()+raw).hexdigest()[:24]
    directory=stage/'images'/aid;directory.mkdir(parents=True,exist_ok=True)
    with Image.open(io.BytesIO(raw)) as original:
     im=ImageOps.exif_transpose(original).convert('RGB')
     for suffix,size,quality in [('large',2200,88),('thumb',640,80)]:
      copy=im.copy();copy.thumbnail((size,size));copy.save(directory/(pid+'-'+suffix+'.jpg'),quality=quality,optimize=True)
    album['photos'].append({'src':f'images/{aid}/{pid}-large.jpg','thumb':f'images/{aid}/{pid}-thumb.jpg'})
    if n%25==0: print(f'處理 {n+1}/{len(files)}',flush=True)
  data=list(albums.values())
  (stage/'albums.js').write_text('window.PHOTO_ALBUMS = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
  # 完成全部轉換才更新；舊圖與清單移入備份，可手動復原。
  backup=BASE/'backups'/datetime.now().strftime('%Y%m%d-%H%M%S-%f')
  backup.mkdir(parents=True)
  moved=[];installed=[]
  try:
   for name in ('images','albums.js'):
    if (BASE/name).exists(): shutil.move(str(BASE/name),str(backup/name));moved.append(name)
    shutil.move(str(stage/name),str(BASE/name));installed.append(name)
  except Exception:
   for name in installed:
    p=BASE/name
    if p.is_dir(): shutil.rmtree(p)
    elif p.exists(): p.unlink()
   for name in moved: shutil.move(str(backup/name),str(BASE/name))
   raise
  print('完成：',[(a['name'],len(a['photos'])) for a in data])
 finally: shutil.rmtree(stage,ignore_errors=True)

if __name__=='__main__':
 try:
  if len(sys.argv)>1: filename=sys.argv[1]
  else:
   import tkinter as tk
   from tkinter import filedialog,messagebox
   root=tk.Tk();root.withdraw()
   filename=filedialog.askopenfilename(title='選擇完整照片總合集 ZIP',filetypes=[('ZIP','*.zip')])
   if filename and not messagebox.askyesno('更新全部相簿','本次 ZIP 將取代網站全部相簿清單。舊版本會備份。請選完整總合集，是否繼續？'): filename=''
   root.destroy()
  if filename:run(filename)
 except Exception as e:
  print('匯入失敗：',e);sys.exit(1)
