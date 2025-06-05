# Platform for creating and taking Courses

## Technologies
- <img src='https://github.com/yaryna-bashchak/maths-course/assets/90560209/e3d0cafd-dcf6-4db2-9331-b8ca7b558d99' height='25'> **.NET** for the Back-end
- <img src='https://github.com/yaryna-bashchak/maths-course/assets/90560209/27b894e3-2717-4629-902d-3f46090a7502' height='25'> **React** for the Front-end
- <img src='https://github.com/yaryna-bashchak/maths-course/assets/90560209/e745a456-bd6a-4605-a679-9fd24fe14d36' height='25'> **Redux** for storing data from database on Front-end
- <img src='https://github.com/yaryna-bashchak/maths-course/assets/90560209/38fe52c2-2880-43e3-92be-1b9da5601e77' height='18'> **Cloudinary** server for storing videos and images
- <img src='https://github.com/user-attachments/assets/d090c1aa-b704-46d4-8c39-99db454e4fc5' height='23'> **Stripe** service for receiving payments

## About project

This is a Platform for creating and taking the courses. Here is a web API that helps you interact with a database that stores courses data, and the client side to create and take courses (log in, create and complete lessons, upload and watch videos, take tests).
 
<!---More about business logic, database schema, component diagram you can see in [design document](https://docs.google.com/document/d/1bEvHXDxrGMU5eWxjBdT6eoA5OIkL18bKe9ypRxkODgo/edit?usp=sharing). --->

To run the project locally see "How to run".

## How to run
- first of all, you need to install [.Net 8.0](https://dotnet.microsoft.com/en-us/download) (if you do not already have it)
- open this folder in [VS Code](https://code.visualstudio.com/download)

Now you're ready to start.
If you want to **run the app**:

- run Docker Desktop and the following command to create postgres database

<code>$ docker run --name devCourse -e POSTGRES_USER=appuser -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres:latest</code>

- go to API folder, set 6 user-secrets: 3 for Cloudinary (that stores videos) and 3 for Stripe (is used for payments):

<code>$ cd API</code></br>
<code>$ dotnet user-secrets set "\<KeyName\>" "\<Value\>"</code></br>

<img width="800" alt="image" src="https://github.com/user-attachments/assets/0a1edc76-3b14-43cc-a8d8-5ff177cb05fb">

- run the API:

<code>$ dotnet restore </code></br>
<code>$ dotnet run</code>

- run client side using the following commands:

<code>$ cd client</code></br>
<code>$ npm install</code></br>
<code>$ npm start</code>

- to receive webhook information from Stripe when payment is successful and grant the user access to the course, run the following command:

<code>$ stripe listen -f http://localhost:5000/api/payments/webhook -e charge.succeeded</code>

## How to use

### 1) Create your personal account

<img width="821" alt="image" src="https://github.com/user-attachments/assets/4798e521-f86c-471b-8502-17eefdde17ee" />

Then you should see this message about successful registretion.

<img width="300" alt="image" src="https://github.com/user-attachments/assets/07b8a4a6-403f-4705-acde-7ce6bf51df7f">

### 2) Create a Course

> Managing courses is allowed only to users with "Teacher" role. They have "Редагувати курси" tab on the top bar.

Here you can create a new course or edit existing. Only active courses are visible for users.

<img width="719" alt="image" src="https://github.com/user-attachments/assets/87e8bd04-5844-4835-844b-8e81b5edbe39" />
<img width="767" alt="image" src="https://github.com/user-attachments/assets/f8f63a30-ebfd-448b-9bba-4eafff657ee2" />

You can change any information, create new sections, lessons and so on.

<img width="767" alt="image" src="https://github.com/user-attachments/assets/2eecfc6e-5d39-468d-a41f-0811db9528a1" />

<img width="767" alt="image" src="https://github.com/user-attachments/assets/4296b6e4-199f-4bb6-9df7-c9e7c8b0d38e" />

<img width="767" alt="image" src="https://github.com/user-attachments/assets/10fabc80-8df9-402d-a5b9-01deb21bef5b" />

Also create and edit tests.

<img width="767" alt="image" src="https://github.com/user-attachments/assets/e71b3dad-8fa7-4245-9432-e93e259fcfaf" />

<img width="767" alt="image" src="https://github.com/user-attachments/assets/6340e4e0-db73-40c0-bdfa-71ce226f8153" />

Share link to your course with others.

<img width="767" alt="image" src="https://github.com/user-attachments/assets/8d891744-97a3-40bb-b322-43e8f6dc75e5" />

### 3) Take a Course

#### - Buy a Course.

Go to the main page and buy any course.

<img width="767" alt="image" src="https://github.com/user-attachments/assets/a7f0892f-fd9f-4958-9d24-abf673714ea6" />

Choose your plan.

<img width="767" alt="image" src="https://github.com/user-attachments/assets/7099b89b-d9a6-43ed-a3ed-647ec149698a" />

Review purchase.

<img width="767" alt="image" src="https://github.com/user-attachments/assets/aa576c96-b6fa-4525-9081-0732e8d07925" />

Enter card data. Use the following test card data:

> card number: 4242 4242 4242 4242
> 
> expiry date: any future date
>
> CVV: any 3 digits

<img width="767" alt="image" src="https://github.com/user-attachments/assets/57cc04b3-2eed-437f-a40c-76f87d217d03" />

You should see the success message.

<img width="767" alt="image" src="https://github.com/user-attachments/assets/fadb8ad1-cfe9-4e64-b199-e57ebce26f43" />

<img width="767" alt="image" src="https://github.com/user-attachments/assets/282141cf-d600-48cb-83f5-aaa36fee1704" />

#### - Complete some lessons.

Go the course.

![image](https://github.com/user-attachments/assets/368d42f2-3f71-446d-942f-1e4032802d9e)

Choose the lesson and start learning.

![image](https://github.com/user-attachments/assets/9501218e-0f4e-4fcd-81df-b5993b9bf33d)

The lesson consists of videos and tests that should be completed after the lesson.

![image](https://github.com/user-attachments/assets/ea15e221-7444-4847-86d8-110c02a07b79)

Complete the videos. Pass the tests.

<img width="767" alt="image" src="https://github.com/user-attachments/assets/4ad4905f-118b-4241-b069-d9606bae0f26" />

![image](https://github.com/user-attachments/assets/23e13a2f-70ea-4eb8-b9b3-626ced948d69)

After answering, you immediately see whether you are right or not.

![image](https://github.com/user-attachments/assets/e90b6526-3633-4ab3-9f00-e7eaf9c3eba7)

![image](https://github.com/user-attachments/assets/b0aca66f-1dd7-4b04-863c-55e06fcdb157)

At the end, you will see your score.

![image](https://github.com/user-attachments/assets/0cbcae94-7eed-4da3-ad41-d9754fbe1af2)

![image](https://github.com/user-attachments/assets/8fb0f0fd-f0e8-4ba4-85b9-d6561787ec75)

#### - Check your progress

Also you can see what stage each lesson is at (completed, in progress, not started) and how many completed lessons are in each section.

<img width="767" alt="image" src="https://github.com/user-attachments/assets/67ac99db-b17a-46a6-b4f0-c84497507723" />

### Mobile Design

The app is also adapted to smaller devices such as a phone or tablet. For example, for smaller screens, a side menu appears in the header, which repeats the same buttons that are on the large screens.
The content of the pages is also appropriate.

<img src='https://github.com/user-attachments/assets/9307dbcf-9f1e-4499-8317-ed110483731b' width='300'>
<img src='https://github.com/user-attachments/assets/ef1856a4-f91d-4917-94b8-3d365569c144' width='300'>
<img src='https://github.com/user-attachments/assets/60440186-ce96-4b61-9696-23b65c5070d0' width='300'>
<img src='https://github.com/user-attachments/assets/6e7b5ff9-18d8-44ef-b249-4208e6528ad1' width='300'>
<img src='https://github.com/user-attachments/assets/4a2f0aee-461b-4979-8a6f-0f3bf87e1308' width='300'>
<img src='https://github.com/user-attachments/assets/49419df1-fc23-4e2d-ab02-df4b0fa478e9' width='300'>

### Web API

If you want to test how the Web API works it would be enough to run only API folder (see "How to run").

- then open [http://localhost:5000/swagger](http://localhost:5000/swagger) in your browser and try to use some endpoints to get or change data in database.

<img src='https://github.com/yaryna-bashchak/maths-course/assets/90560209/f9867e92-b506-4ea7-8096-152be02fe9ad' width='600'>
<img src='https://github.com/yaryna-bashchak/maths-course/assets/90560209/2400f4a2-5c6c-4426-b99f-149a3a33687c' width='600'>

Example of getting _lesson by id_, where you can see information about the lesson, as well as a list of keywords and lessons that are recommended to be completed/repeated before.

<img src='https://github.com/yaryna-bashchak/maths-course/assets/90560209/24695d81-2e8a-43f6-8418-4db3fcb89956' width='700'>

### Tests
If you want to **run tests** (you also can see that all tests are passed in [_Github Actions_](https://github.com/yaryna-bashchak/maths-course/actions))

- go back to the root folder maths-course if you are not there
- run the following command

<code>$ dotnet test ./API.Tests</code>

Example:

![image](https://github.com/yaryna-bashchak/maths-course/assets/90560209/c05c51ec-8fde-42bd-9022-387070f7b4c3)

<!--- ## Design document

[here](https://docs.google.com/document/d/1bEvHXDxrGMU5eWxjBdT6eoA5OIkL18bKe9ypRxkODgo/edit?usp=sharing) --->
