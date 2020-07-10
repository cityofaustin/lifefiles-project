cd ~/STAGING/MYPASS-BACKEND/mypass

git pull

pm2 stop mypass
pm2 start app.js --name mypass

echo ~~FINISHED~~