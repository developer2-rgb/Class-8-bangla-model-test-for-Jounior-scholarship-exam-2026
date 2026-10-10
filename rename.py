import os

for i in range(1, 47):
  old_name = (
      f"বাংলা model test for anuual and জুনিয়র বৃত্তি পরীক্ষা ২০২৬। ১০০%"
      f" common_{i}.jpg"
  )
  new_name = f"page{i}.jpg"
  if os.path.exists(old_name):
    os.rename(old_name, new_name)
    print(f"Renamed: {old_name} -> {new_name}")

print("সব ফাইলের নাম পরিবর্তন সফল হয়েছে!")
