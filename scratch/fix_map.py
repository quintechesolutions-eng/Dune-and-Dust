import os

file_path = r'c:\Users\quimb\OneDrive\Desktop\Dune-and-Dust\src\components\ItineraryView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace map style
content = content.replace('positron-gl-style', 'voyager-gl-style')

# Replace route colors
content = content.replace('"line-color": "#94a3b8"', '"line-color": "#f59e0b"')
content = content.replace('"line-color": "#cbd5e1"', '"line-color": "#d97706"')
content = content.replace('"line-dasharray": [2, 3]', '"line-dasharray": [2, 2]')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
