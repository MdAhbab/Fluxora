**Install git** 

https://git-scm.com/download/win



**Verify installation**

*git --version*



**Go to folder**

*cd path/to/your/project*



**Initialize the repository**

*bash*

*git init*



**Initial auth config**

*git config --global user.name "Your Name"*

*git config --global user.email "youremail@example.com"*



**Set git remote repository on that folder**

*git remote add origin https://github.com/MdAhbab/Fluxora.git*



**Pull from main**

*git pull origin main*



**Add all project files**

*git add .*

(dot is for all folder, if you wish to add/push only one file then use that file name instead of that dot)



**Commit the changes**

*git commit -m "Commit Message"*



**If you are pushing to main then**

*git push -u origin main*



**If you want to create a new branch and switch to it**

*git checkout -b feature-branch*



**If you are pushing to that branch then**

*git push -u origin Branch-name*



**Update Later Changes**

*After making more changes:*

*git add .*

*git commit -m "Updated project"*

*git push*



**Navigate Between Branches**

*To list all branches:*

*git branch*



**To switch branches:**

*git checkout branch-name*



**To create and switch:**

*git checkout -b new-branch*



**For updating authentication**

*git config --global credential.helper manager*

