import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-analytics.js";

// firestore
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  getDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// auth
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyCIetl8AoKgu7afEIqmIGkNYD96ZwlHAZY",
  authDomain: "my-project-714e0.firebaseapp.com",
  projectId: "my-project-714e0",
  storageBucket: "my-project-714e0.firebasestorage.app",
  messagingSenderId: "1077843298355",
  appId: "1:1077843298355:web:75e3e4db67f037bf6bfb46",
  measurementId: "G-KR07L0TZJ1"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);
const auth = getAuth(app);


// signup
const signupForm = document.getElementById("signup-form");
const signupName = document.getElementById("signup-name");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const signupbtn = document.getElementById("signup");

// login
const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginbtn = document.getElementById("login");

// posts
const posts = document.getElementById("posts");
const title = document.getElementById("title");
const content = document.getElementById("content");
const createPost = document.getElementById("create-post");
const logout = document.getElementById("logout");
const postList = document.getElementById("post-list");
const userList = document.getElementById("user-list");


let currentUser = null;


// auth state
onAuthStateChanged(auth, async (user) => {

  if (user) {

    currentUser = user;

    signupForm.style.display = "none";
    loginForm.style.display = "none";
    posts.style.display = "block";

    getUsers();
    getPosts();

  } else {

    signupForm.style.display = "block";
    loginForm.style.display = "none";
    posts.style.display = "none";

  }

});


// signup
async function signupUser() {

  signupbtn.disabled = true;
  signupbtn.textContent = "loading...";

  try {

    const signUp = await createUserWithEmailAndPassword(
      auth,
      signupEmail.value,
      signupPassword.value
    );

    currentUser = signUp.user;

    await addusers();

    signupbtn.disabled = false;
    signupbtn.textContent = "signup";

    signupName.value = "";
    signupEmail.value = "";
    signupPassword.value = "";

    alert("User signed up successfully");

  } catch (error) {

    signupbtn.disabled = false;
    signupbtn.textContent = "signup";

    alert(error.message);

  }

}


// login
async function loginUser() {

  loginbtn.disabled = true;
  loginbtn.textContent = "loading...";

  try {

    const login = await signInWithEmailAndPassword(
      auth,
      loginEmail.value,
      loginPassword.value
    );

    currentUser = login.user;

    loginbtn.disabled = false;
    loginbtn.textContent = "login";

    loginEmail.value = "";
    loginPassword.value = "";

    alert("User logged in successfully");

  } catch (error) {

    loginbtn.disabled = false;
    loginbtn.textContent = "login";

    alert(error.message);

  }

}


// add user
async function addusers() {

  try {

    await setDoc(doc(db, "getuser", currentUser.uid), {

      name: signupName.value,
      email: signupEmail.value,
      uid: currentUser.uid

    });

  } catch (error) {

    alert(error.message);

  }

}


// add post
async function postAdd() {

  createPost.disabled = true;
  createPost.textContent = "loading...";

  try {

    const post = {

      title: title.value,
      content: content.value,
      uid: currentUser.uid,
      likes: [],
      dislikes: []

    };

    await addDoc(collection(db, "posts"), post);

    await getPosts();

    createPost.disabled = false;
    createPost.textContent = "create post";

    title.value = "";
    content.value = "";

  } catch (error) {

    createPost.disabled = false;
    createPost.textContent = "create post";

    alert(error.message);

  }

}


// get user posts
async function getUserDetails(userId) {

  let id = userId;

  getPosts(id);

}


// get users
async function getUsers() {

  try {

    const getuser = await getDocs(collection(db, "getuser"));

    userList.innerHTML = "";

    getuser.forEach((doc) => {

      const userId = doc.id;
      const userData = doc.data();

      userList.innerHTML += `
        <p onclick="getUserDetails('${userId}')">
          ${userData.name}
        </p>
      `;

    });

  } catch (error) {

    alert(error.message);

  }

}


// get posts
async function getPosts(id) {

  let postQuery;

  if (id) {

    postQuery = query(
      collection(db, "posts"),
      where("uid", "==", id)
    );

  } else {

    postQuery = collection(db, "posts");

  }

  try {

    const getpost = await getDocs(postQuery);

    postList.innerHTML = "";

    getpost.forEach((doc) => {

      const postData = doc.data();

      postList.innerHTML += `
        <div>

          <h3>${postData.title}</h3>

          <p>${postData.content}</p>

          <button onclick="likePost('${doc.id}')">
            Like (${postData.likes?.length || 0})
          </button>

          <button onclick="dislikePost('${doc.id}')">
            Dislike (${postData.dislikes?.length || 0})
          </button>

        </div>
      `;

    });

  } catch (error) {

    alert(error.message);

  }

}


// logout
async function logoutUser() {

  try {

    await signOut(auth);

    alert("Logged out successfully");

  } catch (error) {

    alert(error.message);

  }

}


// like
async function likePost(postId) {

  try {

    const postRef = doc(db, "posts", postId);

    await updateDoc(postRef, {

      likes: arrayUnion(currentUser.uid),
      dislikes: arrayRemove(currentUser.uid)

    });

    await getPosts();

  } catch (error) {

    alert(error.message);

  }

}


// dislike
async function dislikePost(postId) {

  try {

    const postRef = doc(db, "posts", postId);

    await updateDoc(postRef, {

      dislikes: arrayUnion(currentUser.uid),
      likes: arrayRemove(currentUser.uid)

    });

    await getPosts();

  } catch (error) {

    alert(error.message);

  }

}


// get current user
async function getuser() {

  try {

    const userDoc = await getDoc(
      doc(db, "getuser", currentUser.uid)
    );

    if (userDoc.exists()) {

      return userDoc.data();

    } else {

      return null;

    }

  } catch (error) {

    alert(error.message);

  }

}


// inline onclick ke liye
window.likePost = likePost;
window.dislikePost = dislikePost;
window.getUserDetails = getUserDetails;


// buttons
signupbtn.addEventListener("click", signupUser);
loginbtn.addEventListener("click", loginUser);
createPost.addEventListener("click", postAdd);
logout.addEventListener("click", logoutUser);


// toggle login/signup
const showLogin = document.getElementById("show-login");
const showSignup = document.getElementById("show-signup");

showLogin.addEventListener("click", () => {
  signupForm.style.display = "none";
  loginForm.style.display = "block";
});

showSignup.addEventListener("click", () => {
  loginForm.style.display = "none";
  signupForm.style.display = "block";
});
