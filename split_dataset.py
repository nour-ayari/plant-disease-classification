import os, shutil, random
from pathlib import Path

SOURCE = "outputs/enhanced_224"   # images améliorées
DEST   = "data/split"                        # destination

TRAIN_RATIO = 0.70
VAL_RATIO   = 0.15
TEST_RATIO  = 0.15

random.seed(42)

for class_name in os.listdir(SOURCE):
    class_path = os.path.join(SOURCE, class_name)
    if not os.path.isdir(class_path): continue

    images = [f for f in os.listdir(class_path) if f.endswith(('.jpg','.JPG','.png'))]
    random.shuffle(images)

    n = len(images)
    n_train = int(n * TRAIN_RATIO)
    n_val   = int(n * VAL_RATIO)

    splits = {
        "train": images[:n_train],
        "val":   images[n_train:n_train+n_val],
        "test":  images[n_train+n_val:]
    }

    for split, files in splits.items():
        dest_dir = os.path.join(DEST, split, class_name)
        os.makedirs(dest_dir, exist_ok=True)
        for f in files:
            shutil.copy(os.path.join(class_path, f), os.path.join(dest_dir, f))

print("Split terminé !")
print(f"Train : {sum(len(f) for _,_,f in os.walk(DEST+'/train'))} images")
print(f"Val   : {sum(len(f) for _,_,f in os.walk(DEST+'/val'))} images")
print(f"Test  : {sum(len(f) for _,_,f in os.walk(DEST+'/test'))} images")