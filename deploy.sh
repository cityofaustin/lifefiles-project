cd ~/PROD/MYPASS-BACKEND/mypass

git pull

npm install

pm2 stop mypass
pm2 start app.js --name mypass

echo ~~FINISHED~~