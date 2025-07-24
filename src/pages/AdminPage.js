
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';

function AdminPage() {
 const [isAdmin, setIsAdmin] = useState(false);
 const [password, setPassword] = useState('');
 const [messages, setMessages] = useState([]);
 const [selectedMessage, setSelectedMessage] = useState(null);
 const [reply, setReply] = useState('');

 const adminPassword = "admin123";

 const handleLogin = (e) => {
   e.preventDefault();
   if (password === adminPassword) {
     setIsAdmin(true);
   } else {
     alert("Wrong password!");
   }
 };

 useEffect(() => {
   if (!isAdmin) return;

   const q = query(collection(db, 'support_messages'), orderBy('timestamp', 'desc'));
   const unsubscribe = onSnapshot(q, (querySnapshot) => {
     const messagesList = [];
     querySnapshot.forEach((doc) => {
       messagesList.push({ ...doc.data(), id: doc.id });
     });
     setMessages(messagesList);
   });

   return () => unsubscribe();
 }, [isAdmin]);

 const handleReply = async (e) => {
   e.preventDefault();
   try {
     await addDoc(collection(db, 'support_messages'), {
       name: 'Admin',
       message: reply,
       timestamp: new Date(),
       userId: selectedMessage.userId,
       isAdmin: true,
       subject: selectedMessage.subject,
       parentMessageId: selectedMessage.id
     });
     setReply('');
   } catch (error) {
     console.error("Error:", error);
     alert('Error sending reply');
   }
 };

 const groupMessages = (messages) => {
   const grouped = {};
   messages.forEach(msg => {
     if (!msg.parentMessageId) {
       if (!grouped[msg.id]) {
         grouped[msg.id] = {
           main: msg,
           replies: []
         };
       } else {
         grouped[msg.id].main = msg;
       }
     } else {
       if (!grouped[msg.parentMessageId]) {
         grouped[msg.parentMessageId] = {
           replies: [msg]
         };
       } else {
         grouped[msg.parentMessageId].replies.push(msg);
       }
     }
   });
   return grouped;
 };

 if (!isAdmin) {
   return (
     <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
       <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
       <form onSubmit={handleLogin}>
         <input
           type="password"
           value={password}
           onChange={(e) => setPassword(e.target.value)}
           placeholder="Enter admin password"
           className="w-full p-2 border rounded mb-4"
         />
         <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
           Login
         </button>
       </form>
     </div>
   );
 }

 return (
   <div className="max-w-6xl mx-auto p-4">
     <div className="flex justify-between items-center mb-4">
       <h1 className="text-2xl font-bold">Admin Dashboard</h1>
       <button 
         onClick={() => setIsAdmin(false)}
         className="bg-red-500 text-white px-4 py-2 rounded"
       >
         Logout
       </button>
     </div>
     <div className="grid grid-cols-12 gap-4">
       <div className="col-span-4 bg-white shadow rounded-lg p-4">
         <h2 className="text-xl font-bold mb-4">Messages</h2>
         <div className="space-y-2">
           {Object.values(groupMessages(messages)).map(({main}) => main && (
             <div 
               key={main.id} 
               onClick={() => setSelectedMessage(main)}
               className={`p-3 rounded cursor-pointer ${
                 selectedMessage?.id === main.id ? 'bg-blue-100' : 'hover:bg-gray-100'
               }`}
             >
               <div className="flex justify-between">
                 <span className="font-bold">{main.name}</span>
                 <span className="text-xs text-gray-500">
                   {new Date(main.timestamp?.toDate()).toLocaleString()}
                 </span>
               </div>
               <div className="text-sm text-gray-600">{main.subject}</div>
             </div>
           ))}
         </div>
       </div>
       
       <div className="col-span-8">
         {selectedMessage && (
           <div className="bg-white shadow rounded-lg p-4">
             <div className="space-y-4">
               {Object.values(groupMessages(messages))
                 .filter(({main}) => main?.id === selectedMessage.id)
                 .map(({main, replies}) => (
                   <div key={main.id}>
                     <div className="mb-2 p-3 bg-gray-50 rounded">
                       <div className="flex justify-between">
                         <span className="font-bold">{main.name}</span>
                         <span className="text-xs text-gray-500">
                           {new Date(main.timestamp?.toDate()).toLocaleString()}
                         </span>
                       </div>
                       <div className="text-gray-600">{main.subject}</div>
                       <div className="mt-2">{main.message}</div>
                     </div>
                     {replies.map(reply => (
                       <div key={reply.id} className="ml-8 p-3 bg-blue-50 rounded">
                         <div className="flex justify-between">
                           <span className="font-bold">{reply.name}</span>
                           <span className="text-xs text-gray-500">
                             {new Date(reply.timestamp?.toDate()).toLocaleString()}
                           </span>
                         </div>
                         <div className="mt-2">{reply.message}</div>
                       </div>
                     ))}
                   </div>
               ))}
             </div>
             <form onSubmit={handleReply} className="mt-4">
               <textarea
                 value={reply}
                 onChange={(e) => setReply(e.target.value)}
                 placeholder="Type your reply..."
                 className="w-full p-2 border rounded h-32"
                 required
               />
               <button 
                 type="submit"
                 className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
               >
                 Send Reply
               </button>
             </form>
           </div>
         )}
       </div>
     </div>
   </div>
 );
}

export default AdminPage;

