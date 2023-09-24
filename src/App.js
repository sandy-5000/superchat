import React, { useState } from 'react'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import { GoogleAuthProvider } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollection } from 'react-firebase-hooks/firestore'
import { FaArrowCircleDown } from 'react-icons/fa'
import { Button } from '@material-tailwind/react'

const firebaseConfig = {
	apiKey: "AIzaSyAbfrhT-aAW4L8-yiGVQidHEa8YMT9s060",
	authDomain: "superchat-sb.firebaseapp.com",
	projectId: "superchat-sb",
	storageBucket: "superchat-sb.appspot.com",
	messagingSenderId: "76490461059",
	appId: "1:76490461059:web:e6cf43ab79e62cc920b0b6",
	measurementId: "G-236TZJD8YM"
}
firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {

	const [user] = useAuthState(auth)

	return (
		<div className="App">
			<header>
				<h1 className="mt-5 text-center text-3xl font-semibold">
					Superchat!
				</h1>
			</header>
			<section>
				{user
					? <>
						<Signout />
						<ChatRoom />
					</>
					: <Signin />}
			</section>
		</div>
	)
}

function Signin() {

	const signInWithGoogle = () => {
		const provider = new GoogleAuthProvider()
		auth.signInWithPopup(provider).then((result) => {
			console.log('login success')
		})
	}

	return (
		<>
			<div className="flex justify-center mt-10">
				<Button onClick={signInWithGoogle} className="bg-blue-300 px-4 py-2 rounded-sm font-semibold">Sign In</Button>
			</div>
		</>
	)
}

function Signout() {
	return auth.currentUser && (
		<>
			<div className="flex justify-between m-5 p-5 rounded-md bg-slate-50">
				<div className="flex">
					<img className="rounded-full h-8 w-8 mx-2" src={auth.currentUser.photoURL} alt={auth.currentUser.displayName} />
					<span className="text-xl">{auth.currentUser.displayName}</span>
				</div>
				<Button onClick={() => auth.signOut()} className="bg-blue-300 px-4 py-2 rounded-sm font-semibold">Sign Out</Button>
			</div>
		</>

	)
}

function ChatRoom() {

	const messagesRef = firestore.collection('messages')
	const query = messagesRef.orderBy('createdAt').limit(25)

	const [querySnapshot] = useCollection(query)

	const messages = querySnapshot?.docs.map(doc => ({
		id: doc.id,
		...doc.data(),
	}))

	const [formValue, setFormValue] = useState('')

	const sendMessage = async (e) => {
		e.preventDefault()
		const { displayName, email, photoURL } = auth.currentUser
		await messagesRef.add({
			text: formValue,
			displayName, email, photoURL,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
		})
		setFormValue('')
	}

	return (
		<>
			<div className="px-5 py-3 relative overflow-y-scroll" style={{ height: '57vh' }}>
				<div className="fixed bg-blue-500 text-slate-100 text-2xl p-2 rounded-full" style={{right: 20, bottom: 150}}><FaArrowCircleDown /></div>
				{messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
			</div>
			<div className="px-5 py-3">
				<form onSubmit={sendMessage}>
					<input value={formValue} onChange={(e) => setFormValue(e.target.value)} className="bg-slate-100 h-16 rounded-md w-full focus:outline-0 p-5" type="text" />
					<div className="flex justify-end mt-5">
						<Button type="submit" className="bg-blue-300 px-4 py-2 rounded-sm font-semibold">Send</Button>
					</div>
				</form>
			</div>
		</>
	)
}

function ChatMessage(props) {

	const { text, email, createdAt, photoURL, displayName } = props.message
	const date = new Date(createdAt?.seconds * 1000)
	const send = email === auth?.currentUser?.email

	return (
		<>
			<div className={send ? "flex justify-end" : ""}>
				<div className="bg-slate-100 p-2 m-2 rounded-lg w-10/12 flex lg:justify-start md:justify-start justify-between">
					<div className="flex justify-center mt-1">
						<img className="rounded-full h-8 w-8 mx-2" src={photoURL} alt={displayName} />
					</div>
					<div className="mx-2 w-11/12">
						<p>{text}</p>
						<span className="block text-xs mt-2">{date.toLocaleString()}</span>
					</div>
				</div>
			</div>
		</>
	)
}

export default App
