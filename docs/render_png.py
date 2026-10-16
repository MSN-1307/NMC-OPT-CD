import subprocess
import os

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
html_path = os.path.abspath("docs/view_architecture.html")
png_path = os.path.abspath("docs/nmc_opt_studio_architecture.png")

file_url = "file:///" + html_path.replace("\\", "/")

cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=2000,2750",
    f"--screenshot={png_path}",
    file_url
]

print("Executing Edge screenshot...")
res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
print("Exit code:", res.returncode)
if os.path.exists(png_path):
    print(f"PNG generated successfully: {png_path} ({os.path.getsize(png_path):,} bytes)")
    # Also copy to root
    root_png = os.path.abspath("nmc_opt_studio_architecture.png")
    with open(png_path, "rb") as fsrc, open(root_png, "wb") as fdst:
        fdst.write(fsrc.read())
    print(f"PNG copied to root: {root_png}")
else:
    print("PNG was not created.")
