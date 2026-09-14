import os
import zipfile
import sys

def make_zip(root_dir, output_zip):
    exclude_dirs = {'node_modules', 'dist', '.git', '.cache', '__pycache__'}
    exclude_files = {'.DS_Store'}

    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for f in files:
                if f in exclude_files:
                    continue
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, root_dir)
                zipf.write(full_path, rel_path)

if __name__ == '__main__':
    root = sys.argv[1] if len(sys.argv) > 1 else '.'
    out = sys.argv[2] if len(sys.argv) > 2 else '/tmp/geoai-studio.zip'
    make_zip(root, out)
    print(f"Created {out} successfully, size: {os.path.getsize(out)} bytes")
