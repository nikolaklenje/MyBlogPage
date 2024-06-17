---
id: "1"
title: "What is React?"
category: "React"
date: "2024-06-07"
image: "/reactjs.png"
description: "This is going to be description of the first blog that I will ever write"
---

Reactjs is a powerful, open-source JavaScript library for creating interactive and dynamic User Interfaces.

## **History**

React was created by Jordan Walke, a Software Engineer at Meta. It was first deployed in Facebook's News Feed in 2011. The first Big impact it had was in 2012 when Facebook bought its competitor, Instagram. At the time, Instagram was only a simple mobile app, and Facebook decided that it needed a web page as well. The Instagram team integrated React and used it to build interactive and dynamic parts of UI that require frequent and real-time updates (Profile pages, Post Feeds, Comments, and Likes).
In 2013, at JSConf US, React was officially open-sourced, a pivotal moment that significantly accelerated its adoption and growth. This move transformed React into a community-driven project, fostering a vibrant ecosystem of contributors and users. It quickly became one of the most popular JavaScript libraries, with its open-source nature attracting hundreds of GitHub contributors every day.

### **Why React**

For developing user interfaces, React is the best fit. It's not just a fast, flexible, and declarative JavaScript library but also a community. Its extensive documentation and the support of its vast, fast-growing community make it a breeze to learn. With React, you can build UI using small, self-contained components that are easy to reuse or replace.

**Key features:**

1. VDOM - React's use of a virtual DOM (Document Object Model) is a game-changer. Traditional DOM, being three-structured, can trigger a domino effect with even minor changes on the root, causing significant impacts on others. However, React's virtual DOM, stored in your memory and not on the screen, compares to the DOM after new updates are made and updates only the parts that have changed, significantly improving performance and efficiency.
2. Component-Based Architecture — React-based applications are built of small UI components that are JavaScript functions able to accept inputs (called props). Everything visible on the screen can be broken down into components, as small as a simple button, and placed on the entire page, which makes them highly reusable and easily replaceable.
3. JSX (JavaScript XML)—When introduced, it caused a massive upset in the Development world. JSX allows us to write HTML code inside of the JavaScript function. It promotes encapsulation by holding the rendering logic (JavaScript) and markup (HTML) in the same place (components).

**Setting up React**

You can use React either as a standalone library or within a framework. Here’s how to set it up:

1. **Prerequisites:**
   In order to install React you need to have installed on your local machine Node.js.
   Node.js is a JavaScript runtime environment that allows you to run JavaScript on the server-side. To install Node.js, you can go to the official website (https://nodejs.org/en/), where you will have two options to install the latest or recommended version.
   Using the terminal, navigate to the directory where you want to install your app.

2. **Instaling React without framework:**
   Using React without a framework is possible, especially if you use React for part of your page and not the whole project.

```js
npx create-react-app my-app
cd my-app
npm start
```

This will start the development server with hot reloading at http://localhost:3000/.

3. **Installing with the framework:**

If you are building a completely React-based app, using a framework is the way to go. The most popular React frameworks are Next.js, Remix, Gatsby, and Expo (for native apps). The example below shows an installation with Next.js, a lightweight framework that provides styling and routing solutions out of the box.

Using Nextjs:

```js
npx create-next-app@latest
cd my-next-app
npm start
```

This command sets up a Next.js project and starts the development server at http://localhost:3000/.

**Conclusion**

ReactJS offers a robust foundation for building interactive and dynamic user interfaces. With its efficient virtual DOM, reusable components, and supportive community, it stands out as a top choice for developers. Stay tuned for upcoming blogs where we dive deeper into each of these concepts in React.
