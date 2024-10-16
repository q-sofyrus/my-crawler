import os

# List of folder names
folder_names = [
    "Assignments",
    "Batch",
    "Catalog of photographs",
    "Collection of photographs",
    "Collection of photos",
    "Collection of published photos",
    "Collection of unpublished photos",
    "Copyright registration for a group of published photographs",
    "Copyright registration for a group of unpublished photographs",
    "Groups of commercial images",
    "Groups of commercial photographs",
    "Groups of commercial photos",
    "Group registration",
    "Group registration photo",
    "Group registration photos",
    "Group registration of unpublished images",
    "Group registration of published images",
    "Group registration of published photos",
    "Group registration of published photographs",
    "Group registration for a group of published photographs",
    "Group registration of unpublished images",
    "Group registration for a group of unpublished images",
    "Group registration photos",
    "Groups of published photos",
    "Groups of published photographs",
    "Groups of unpublished photographs",
    "Groups of visual material",
    "Individual photographs",
    "Miscellaneous published photographs",
    "Photo assignments",
    "Photo published",
    "Photo registration",
    "Photo submission",
    "Photograph registration",
    "Photographs",
    "Published collection",
    "Published images",
    "Published work",
    "Published works",
    "Q1 published photographs",
    "Q2 published photographs",
    "Q3 published photographs",
    "Q4 published photographs",
    "Registrations",
    "Unpublished works",
    "Visual images",
    "Visual material"
]

# Create folders
for folder in folder_names:
    try:
        os.makedirs(folder, exist_ok=True)
        print(f"Folder created: {folder}")
    except Exception as e:
        print(f"Error creating folder {folder}: {e}")
