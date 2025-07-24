import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, where, onSnapshot, addDoc } from 'firebase/firestore';

function SupportPage() {
 const [name, setName] = useState('');
 const [subject, setSubject] = useState('');
 const [message, setMessage] = useState('');
 const [userMessages, setUserMessages] = useState([]);
 const [userId] = useState('guest-' + Math.random().toString(36).substr(2, 9));

 useEffect(() => {
   const messagesRef = collection(db, 'support_messages');
   const q = query(messagesRef, where('userId', '==', userId));
   
   const unsubscribe = onSnapshot(q, (querySnapshot) => {
     const messages = [];
     querySnapshot.forEach((doc) => {
       messages.push({
         ...doc.data(),
         id: doc.id
       });
     });
     
     const groupedMessages = messages.reduce((acc, msg) => {
       if (!msg.parentMessageId) {
         if (!acc[msg.id]) {
           acc[msg.id] = {
             main: msg,
             replies: []
           };
         } else {
           acc[msg.id].main = msg;
         }
       } else {
         if (!acc[msg.parentMessageId]) {
           acc[msg.parentMessageId] = {
             replies: [msg]
           };
         } else {
           acc[msg.parentMessageId].replies.push(msg);
         }
       }
       return acc;
     }, {});

     setUserMessages(Object.values(groupedMessages));
   });

   return () => unsubscribe();
 }, [userId]);

 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     await addDoc(collection(db, "support_messages"), {
       name,
       subject,
       message,
       timestamp: new Date(),
       userId,
       isAdmin: false,
       parentMessageId: null
     });
     setMessage('');
     alert('Message sent successfully!');
   } catch (error) {
     alert('Error sending message');
   }
 };

 return (
   <div className="max-w-2xl mx-auto p-4">
     <div className="bg-white shadow rounded-lg p-6 mb-6">
       <h2 className="text-2xl font-bold mb-4">Customer Support</h2>
       <form onSubmit={handleSubmit} className="space-y-4">
         <input
           type="text"
           value={name}
           onChange={(e) => setName(e.target.value)}
           placeholder="Your Name"
           className="w-full p-2 border rounded"
           required
         />
         <select
           value={subject}
           onChange={(e) => setSubject(e.target.value)}
           className="w-full p-2 border rounded"
           required
         >
           <option value="">Select Issue</option>
           <option value="Defected Product">Defected Product</option>
           <option value="Late Order">Late Order</option>
           <option value="Lost Product">Lost Product</option>
           <option value="Suggestion">Suggestion</option>
         </select>
         <textarea
           value={message}
           onChange={(e) => setMessage(e.target.value)}
           placeholder="Type your message..."
           className="w-full p-2 border rounded h-32"
           required
         />
         <button 
           type="submit"
           className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
         >
           Send Message
         </button>
       </form>
     </div>

     <div className="bg-white shadow rounded-lg p-6">
       <h3 className="text-xl font-bold mb-4">Your Messages</h3>
       <div className="space-y-4">
         {userMessages.map(({main, replies}) => main && (
           <div key={main.id} className="border-b pb-4">
             <div className="flex justify-between items-start">
               <div>
                 <p className="font-semibold">{main.subject}</p>
                 <p className="text-gray-600">{main.message}</p>
               </div>
               <span className="text-xs text-gray-500">
                 {new Date(main.timestamp?.toDate()).toLocaleString()}
               </span>
             </div>
             {replies && replies.map(reply => (
               <div key={reply.id} className="mt-2 ml-4 p-2 bg-blue-50 rounded">
                 <p className="text-sm"><strong>Admin Reply:</strong> {reply.message}</p>
                 <span className="text-xs text-gray-500">
                   {new Date(reply.timestamp?.toDate()).toLocaleString()}
                 </span>
               </div>
             ))}
           </div>
         ))}
       </div>
     </div>
   </div>
 );
}

export default SupportPage;


