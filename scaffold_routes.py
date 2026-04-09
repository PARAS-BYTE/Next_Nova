import os
import re

app_tsx_path = "c:\\Users\\PARAS\\Desktop\\LEARN NOVA\\Front\\src\\App.tsx"
next_app_dir = "c:\\Users\\PARAS\\Desktop\\LEARN NOVA\\nova-next\\src\\app"

with open(app_tsx_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find all Route elements and extract path and element names
routes = re.findall(r'<Route\s+path="([^"]+)"\s+element=\{([\s\S]*?)\}\s*/>', content)

def get_component_name(element_code):
    match = re.search(r'<([A-Z][a-zA-Z0-9_]*)', element_code)
    if match:
        name = match.group(1)
        # Exception if there's StudentLayout or AdminLayout wrapping it
        if name in ["StudentLayout", "AdminLayout", "AdminRoutes"]:
            inner_match = re.findall(r'<([A-Z][a-zA-Z0-9_]*)', element_code)
            for inner in inner_match:
                if inner not in ["StudentLayout", "AdminLayout", "AdminRoutes"]:
                    return inner, name
        return name, None
    return "Unknown", None

for path, element in routes:
    if path == "*":
        continue
    
    path_cleaned = path.strip("/")
    if path_cleaned == "":
        dir_path = next_app_dir
    else:
        # replace params like :taskId with [taskId]
        parts = path_cleaned.split("/")
        new_parts = []
        for p in parts:
            if p.startswith(":"):
                new_parts.append(f"[{p[1:]}]")
            else:
                new_parts.append(p)
        dir_path = os.path.join(next_app_dir, *new_parts)
    
    os.makedirs(dir_path, exist_ok=True)
    
    comp_name, layout = get_component_name(element)
    
    with open(os.path.join(dir_path, "page.tsx"), "w", encoding="utf-8") as pf:
        # For simplicity, we just import from pages_old and render
        # We need to find the correct import path for the comp_name. We'll assume a flat or simple lookup, 
        # or just make them all client components that lazily export the old page wrapper.
        pf.write(f'''"use client";

import {{ Suspense }} from "react";
// Adjust import path manually if needed
// import {comp_name} from "@/pages_old/...";

export default function Page() {{
  return (
    <div className="w-full h-full flex flex-col items-center justify-center pt-20">
       <h1 className="text-2xl font-bold">Migration Placeholder for {comp_name}</h1>
       <p>Path: {path}</p>
    </div>
  );
}}
''')

print("Created Next.js page structure based on App.tsx")
