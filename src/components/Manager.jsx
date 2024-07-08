import React from 'react'
import { useRef, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { useAuth0 } from "@auth0/auth0-react";
import CryptoJS from 'crypto-js';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
const Manager = () => {
    const ref = useRef()
    const passwordRef = useRef()
    const [form, setform] = useState({ site: "", username: "", password: "" })
    const [passwordArray, setPasswordArray] = useState([])
    const { user, isAuthenticated, isLoading } = useAuth0();


    const getPasswords = async () => {
        let req = await fetch("http://localhost:3000/")
        let passwords = await req.json()
        // console.log(passwords)
        
        setPasswordArray(passwords)
        // console.log(setPasswordArray)
    }


    useEffect(() => {
        getPasswords()
    }, [])


    const secretKey = 'my-secret-key';
    const encryptData = (data, key) => {
        return CryptoJS.AES.encrypt(data, key).toString();
    };

    const decryptData = (ciphertext, key) => {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    };

    const copyText = (text) => {
        toast('Copied to clipboard!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
        navigator.clipboard.writeText(text)
    }

    const showPassword = () => {
        passwordRef.current.type = "text"
        console.log(ref.current.src)
        if (ref.current.src.includes("icons/eyecross.png")) {
            ref.current.src = "icons/eye.png"
            passwordRef.current.type = "password"
        }
        else {
            passwordRef.current.type = "text"
            ref.current.src = "icons/eyecross.png"
        }

    }
    const generatePassword = (length = 12) => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let password = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            password += charset.charAt(Math.floor(Math.random() * n));
        }
        return password;
    };


      //HAve i been pawned api
      const sha1Hash = (str) => CryptoJS.SHA1(str).toString(CryptoJS.enc.Hex).toUpperCase();

      const checkPasswordPwned = async (password) => {
          const hashedPassword = sha1Hash(password);
          const prefix = hashedPassword.substring(0, 5);
          const suffix = hashedPassword.substring(5,hashedPassword.length);
          console.log(hashedPassword)
          try {
              const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
              console.log(response)
              
              if (response.status === 200) { 
                  const hashes = response.data.split('\n');

                  
                //   console.log("suffix",suffix);
                   console.log(hashes);
                   var breaches=0;
                  for(let i=0;i<hashes.length;i++){
                    var hash=hashes[i];
                    var hashSuffix=hash.split(':')
                    if(hashSuffix[0]==suffix){
                        breaches=hashSuffix[1];
                        break;
                    }
                  }
                  return breaches;
              } else {
                  throw new Error('Failed to check password against Pwned Passwords API');
              }
          } catch (error) {
              console.error('Error checking password against Pwned Passwords API:', error.message);
               return false;
          }
      };
      
    const savePassword = async () => {

        if (!isAuthenticated) {
            toast.warn('Please Login To Save Passwords', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } 

        else if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {

            // If any such id exists in the db, delete it 
            // await fetch("http://localhost:3000/", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: form.id }) })

            // setPasswordArray([...passwordArray, { ...form, id: uuidv4() }])


            const isPwned =  await checkPasswordPwned(form.password);
            console.log(isPwned)
             var c=1;
            // let c=0;
          if(isPwned>0){ c=confirm(`This Passwords has been found in ${isPwned} breaches. Do you still wish to continue with this password?` )}
            // if (isPwned) {
            //     toast.warn('Warning: This password has been exposed in known data breaches. Please choose another one.', {
            //         position: "top-right",
            //         autoClose: 10000,
            //         hideProgressBar: false,
            //         closeOnClick: true,
            //         pauseOnHover: true,
            //         draggable: true,
            //         progress: undefined,
            //         theme: "dark",
            //     });
            //     return;
            // }



                if(c){

            const encryptedPassword = encryptData(form.password, secretKey);
             const oldPassword = { ...form, password: form.password, id: uuidv4(), user:user.email};
            const newPassword={ ...form, password: encryptedPassword, id: uuidv4(),user:user.email};
            setPasswordArray([...passwordArray, oldPassword]);


            await fetch("http://localhost:3000/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newPassword) })

            // Otherwise clear the form and show toast
            setform({ site: "", username: "", password: "" })
            toast('Password saved!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });





            
        }
        else {
            toast('Error: Password not saved!');
        }
    }
    }

    const deletePassword = async (id) => {
        console.log("Deleting password with id ", id)
        let c = confirm("Do you really want to delete this password?")
        if (c) {
            setPasswordArray(passwordArray.filter(item => item.id !== id))
            
            await fetch("http://localhost:3000/", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })

            toast('Password Deleted!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true, 
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }

    }

    const editPassword = (id) => {
        setform({ ...passwordArray.filter(i => i.id === id)[0], id: id })
        setPasswordArray(passwordArray.filter(item => item.id !== id))
    }


    const handleChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value })
    }

    const handleGeneratePassword = () => {
        const generatedPassword = generatePassword();
        setform({ ...form, password: generatedPassword });
    };

    return (
        <>
            <ToastContainer />
            <div className="absolute inset-0 -z-10 h-full w-full bg-blue-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"><div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div></div>
            <div className=" p-3 md:mycontainer min-h-[88.2vh] ">
                <h1 className='text-4xl text font-bold text-center'>
                    <span>Cipher</span><span className='text-blue-500'>Safe</span>

                </h1>
                <p className='text-blue-900 text-lg text-center'>Password Manager Web App</p>

                <div className="flex flex-col p-4 text-black gap-8 items-center">
                    <input value={form.site} onChange={handleChange} placeholder='Enter website URL' className='rounded-full border border-blue-500 w-full p-4 py-1' type="text" name="site" id="site" />
                    <div className="flex flex-col md:flex-row w-full justify-between gap-8">
                        <input value={form.username} onChange={handleChange} placeholder='Enter Username' className='rounded-full border border-blue-500 w-full p-4 py-1' type="text" name="username" id="username" />
                        <div className="relative">
                            <input ref={passwordRef} value={form.password} onChange={handleChange} placeholder='Enter Password' className='rounded-full border border-blue-500 w-full p-4 py-1' type="password" name="password" id="password" />
                            <span className='absolute right-[3px] top-[4px] cursor-pointer' onClick={showPassword}>
                                <img ref={ref} className='p-1' width={26} src="icons/eye.png" alt="eye" />
                            </span>
                        </div>
                        
                    </div>
                    <button onClick={handleGeneratePassword} className='flex justify-center items-center gap-2 bg-blue-400 hover:bg-blue-300 rounded-lg px-8 py-2 w-35 h-10 border-blue-900'>
                        <lord-icon trigger="hover"></lord-icon>
                        Generate Password
                    </button>
                    <button onClick={savePassword} className='flex justify-center items-center gap-2 bg-blue-400 hover:bg-blue-300 rounded-full px-8 py-2 w-fit border border-blue-900'>
                        
                        Save</button>
                </div>

                <div className="passwords">
                    <h2 className='font-bold text-2xl py-4'>Your Passwords</h2>
                    {!isAuthenticated && <div>Login To See Your Passwords</div>}
                    {isAuthenticated && passwordArray.length === 0 && <div> No passwords Added</div>}
                    {isAuthenticated && passwordArray.length != 0 && <table className="table-auto w-full rounded-md overflow-hidden mb-10">
                        <thead className='bg-blue-800 text-white'>
                            <tr>
                                <th className='py-2'>Site</th>
                                <th className='py-2'>Username</th>
                                <th className='py-2'>Password</th>
                                <th className='py-2'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='bg-blue-100'>
                            {passwordArray.map((item, index) => {
                                if(item.user==user.email){
                                return <tr key={index}>
                                    <td className='py-2 border border-white text-center'>
                                        <div className='flex items-center justify-center '>
                                            <a href={item.site} target='_blank'>{item.site}</a>
                                            <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.site) }}>
                                                <lord-icon
                                                    style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                    src="https://cdn.lordicon.com/iykgtsbt.json"
                                                    trigger="hover" >
                                                </lord-icon>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='py-2 border border-white text-center'>
                                        <div className='flex items-center justify-center '>
                                            <span>{item.username}</span>
                                            <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.username) }}>
                                                <lord-icon
                                                    style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                    src="https://cdn.lordicon.com/iykgtsbt.json"
                                                    trigger="hover" >
                                                </lord-icon>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='py-2 border border-white text-center'>
                                        <div className='flex items-center justify-center '>
                                            <span>{"*".repeat(item.password.length)}</span>
                                            <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(decryptData(item.password,secretKey)) }}>
                                                <lord-icon
                                                    style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                    src="https://cdn.lordicon.com/iykgtsbt.json"
                                                    trigger="hover" >
                                                </lord-icon>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='justify-center py-2 border border-white text-center'>
                                        <span className='cursor-pointer mx-1' onClick={() => { editPassword(item.id) }}>
                                            <lord-icon
                                                src="https://cdn.lordicon.com/gwlusjdu.json"
                                                trigger="hover"
                                                style={{ "width": "25px", "height": "25px" }}>
                                            </lord-icon>
                                        </span>
                                        <span className='cursor-pointer mx-1' onClick={() => { deletePassword(item.id) }}>
                                            <lord-icon
                                                src="https://cdn.lordicon.com/skkahier.json"
                                                trigger="hover"
                                                style={{ "width": "25px", "height": "25px" }}>
                                            </lord-icon>
                                        </span>
                                    </td>
                                </tr>
}})}
                        </tbody>
                    </table>}
                </div>
            </div>

        </>
    )
}

export default Manager
