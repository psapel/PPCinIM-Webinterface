- Install flask, flask-cors, python-dotenv and other dependencies

- Install NodeJS LTS (v20)
```js
   cd PPCinIM-Webinterface
   npm install
   npm run dev
```

- Start Elasticsearch
```js
   cd elasticsearch
   bin\elasticsearch.bat
```

- Start neo4j
```js
   username: neo4j
   password: 12345678
```

- Get odoo instance
```js
   username: neo4j
   password: 12345678
```

- Run AASX-Server
```js
   Go to AASX directory
   .\AasxServerBlazor.exe  --no-security --data-path ./aasxs
```

- Run Webinterface
```js
   cd PPCinIM-Webinterface
   flask run  or  python -m flask run
   http://localhost:5173
```



