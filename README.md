Download and install Elasticsearch from the official website:  https://www.elastic.co/downloads/elasticsearch<br>
Once installed, start Elasticsearch.<br>
Open a Command Prompt or PowerShell window with administrator privileges.<br>
Navigate to the Elasticsearch installation directory.<br>
Run .\bin\elasticsearch.bat to start Elasticsearch.<br>
Keep the command prompt open and elasticsearch should run on port 9200

Downlaod and install MongoDB from the official website: https://www.mongodb.com/try/download/community<br>
Install mongo and start mongo in command prompt or use the MongoDB Compass to create a database and collections

Steps to clone the repository and start the servers

1.Clone the repository:<br>
git clone https://github.com/amideo5/Book_Store_Project

2.Backend Setup:<br>
cd backend<br>
npm install

3.Configure the MongoDB connection by changing the .env file with your MongoDB URI:<br>
mongoDBURL=mongodb://localhost:27017/bookstore(Change with your MongoDB url)

4.Start the backend server:<br>
npm run dev

5.Frontend Setup(new terminal):<br>
cd frontend<br>
npm install<br>
npm run dev
