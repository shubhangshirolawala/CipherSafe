import React, { useRef, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { useAuth0 } from "@auth0/auth0-react";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
const Manager = () => {
    const ref = useRef();
    const passwordRef = useRef();
    const [form, setForm] = useState({ site: "", username: "", password: "" });
    const [passwordArray, setPasswordArray] = useState([]);
    const { user, isAuthenticated, isLoading } = useAuth0();

    const secretKey = 'my-secret-key';
    // console.log(user)

    useEffect(() => {
        let passwords = localStorage.getItem("passwords");
        if (passwords) {
            setPasswordArray(JSON.parse(passwords));
        }
    }, []);

    const encryptData = (data, key) => {
        return CryptoJS.AES.encrypt(data, key).toString();
    };

    const decryptData = (ciphertext, key) => {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    };


        //HAve i been pawned api
        const sha1Hash = (str) => CryptoJS.SHA1(str).toString(CryptoJS.enc.Hex).toUpperCase();

        const checkPasswordPwned = async (password) => {
            const hashedPassword = sha1Hash(password);
            const prefix = hashedPassword.substring(0, 5);
            console.log(hashedPassword)
            try {
                const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
                console.log(response)
                
                if (response.status === 200) { 
                    const hashes = response.data.split('\n');

                    const suffix = hashedPassword.substring(5);
                    console.log("suffix",suffix);
                     console.log(hashes);
                    for (let hash of hashes) {
                        const responseLine = hash;
                        const countStr = responseLine.split(':')[1].trim(); 
                        const count = parseInt(countStr); 
                        if(count>10){return true;}
                    }
                    return false;
                } else {
                    throw new Error('Failed to check password against Pwned Passwords API');
                }
            } catch (error) {
                console.error('Error checking password against Pwned Passwords API:', error.message);
                 return false;
            }
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
        navigator.clipboard.writeText(text);
    };

    const showPassword = () => {
        passwordRef.current.type = "text";
        if (ref.current.src.includes("icons/eyecross.png")) {
            ref.current.src = "icons/eye.png";
            passwordRef.current.type = "password";
        } else {
            passwordRef.current.type = "text";
            ref.current.src = "icons/eyecross.png";
        }
    };

    const generatePassword = (length = 12) => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let password = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            password += charset.charAt(Math.floor(Math.random() * n));
        }
        return password;
    };

    const savePassword = () => {
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
        } else if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {


            const isPwned =  checkPasswordPwned(form.password);
        
            if (isPwned) {
                toast.warn('Warning: This password has been exposed in known data breaches. Please choose another one.', {
                    position: "top-right",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                return;
            }




            const encryptedPassword = encryptData(form.password, secretKey);
            const newPassword = { ...form, password: encryptedPassword, id: uuidv4() };
            const updatedPasswordArray = [...passwordArray, newPassword];
            setPasswordArray(updatedPasswordArray);
            localStorage.setItem("passwords", JSON.stringify(updatedPasswordArray));
            setForm({ site: "", username: "", password: "" });
            toast.success('Password Saved', {
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
            toast.warn('Error: Password and Username Length Should Be Greater Than 3', {
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
    };

    const deletePassword = (id) => {
        let c = confirm("Do you really want to delete this password?");
        if (c) {
            const updatedPasswordArray = passwordArray.filter(item => item.id !== id);
            setPasswordArray(updatedPasswordArray);
            localStorage.setItem("passwords", JSON.stringify(updatedPasswordArray));
            toast.success('Password Deleted', {
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
    };

    const editPassword = (id) => {
        const passwordToEdit = passwordArray.find(i => i.id === id);
        passwordToEdit.password = decryptData(passwordToEdit.password, secretKey);
        setForm(passwordToEdit);
        setPasswordArray(passwordArray.filter(item => item.id !== id));
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleGeneratePassword = () => {
        const generatedPassword = generatePassword();
        setForm({ ...form, password: generatedPassword });
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition="Bounce"
            />
            <ToastContainer />
            <div className="absolute inset-0 -z-10 h-full w-full bg-blue-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-lg bg-blue-400 opacity-20 blur-[100px]"></div>
            </div>
            <div className="p-3 md:mycontainer min-h-[88.2vh] ">
                <h1 className='text-4xl text font-bold text-center'>
                    <span>CipherSafe</span>
                </h1>
                <p className='text-blue-900 text-lg text-center'>Your Own Password Manager Application</p>
                <div className="flex flex-col p-4 text-black gap-8 items-center">
                    <input value={form.site} onChange={handleChange} placeholder='Enter website URL' className='rounded-lg border border-blue-500 w-full p-4 py-1' type="text" name="site" id="site" />
                    <div className="flex flex-col md:flex-row w-full justify-between gap-8">
                        <input value={form.username} onChange={handleChange} placeholder='Enter Username' className='rounded-lg border border-blue-500 w-full p-4 py-1' type="text" name="username" id="username" />
                        <div className="relative">
                            <input ref={passwordRef} value={form.password} onChange={handleChange} placeholder='Enter Password' className='rounded-lg border border-blue-500 w-full p-4 py-1' type="password" name="password" id="password" />
                            <span className='absolute right-[3px] top-[4px] cursor-pointer' onClick={showPassword}>
                                <img ref={ref} className='p-1' width={26} src="icons/eye.png" alt="eye" />
                            </span>
                        </div>
                    </div>
                    <button onClick={handleGeneratePassword} className='flex justify-center items-center gap-2 bg-green-400 hover:bg-green-300 rounded-lg px-8 py-2 w-35 h-10 border-green-900'>
                        <lord-icon src="https://cdn.lordicon.com/yzrhtrsg.json" trigger="hover"></lord-icon>
                        Generate Password
                    </button>
                    <button onClick={savePassword} className='flex justify-center items-center gap-2 bg-blue-400 hover:bg-blue-300 rounded-lg px-8 py-2 w-35 h-10 border-blue-900'>
                        <lord-icon src="https://cdn.lordicon.com/jgnvfzqg.json" trigger="hover"></lord-icon>
                        Save
                    </button>
                </div>
                <div className="passwords">
                    <h2 className='font-bold text-2xl py-4'>Your Passwords</h2>
                    {!isAuthenticated && <div>Login To See Your Passwords</div>}
                    {isAuthenticated && passwordArray.length === 0 && <div> No passwords Added</div>}
                    {isAuthenticated && passwordArray.length !== 0 && (
                        <table className="table-auto w-full rounded-md overflow-hidden mb-10">
                            <thead className='bg-blue-800 text-white'>
                                <tr>
                                    <th className='py-2'>Site</th>
                                    <th className='py-2'>Username</th>
                                    <th className='py-2'>Password</th>
                                    <th className='py-2'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='bg-blue-100'>
                                {passwordArray.map((item, index) => (
                                    <tr key={index}>
                                        <td className='py-2 border border-white text-center'>
                                            <div className='flex items-center justify-center '>
                                                <a href={item.site} target='_blank' rel="noreferrer">{item.site}</a>
                                                <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.site) }}>
                                                    <lord-icon
                                                        style={{ width: "25px", height: "25px", paddingTop: "3px", paddingLeft: "3px" }}
                                                        src="https://cdn.lordicon.com/iykgtsbt.json"
                                                        trigger="hover">
                                                    </lord-icon>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-2 border border-white text-center'>
                                            <div className='flex items-center justify-center '>
                                                <span>{item.username}</span>
                                                <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.username) }}>
                                                    <lord-icon
                                                        style={{ width: "25px", height: "25px", paddingTop: "3px", paddingLeft: "3px" }}
                                                        src="https://cdn.lordicon.com/iykgtsbt.json"
                                                        trigger="hover">
                                                    </lord-icon>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-2 border border-white text-center'>
                                            <div className='flex items-center justify-center '>
                                                <span>{decryptData(item.password, secretKey)}</span>
                                                <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(decryptData(item.password, secretKey)) }}>
                                                    <lord-icon
                                                        style={{ width: "25px", height: "25px", paddingTop: "3px", paddingLeft: "3px" }}
                                                        src="https://cdn.lordicon.com/iykgtsbt.json"
                                                        trigger="hover">
                                                    </lord-icon>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='justify-center py-2 border border-white text-center'>
                                            <span className='cursor-pointer mx-1' onClick={() => { editPassword(item.id) }}>
                                                <lord-icon
                                                    src="https://cdn.lordicon.com/gwlusjdu.json"
                                                    trigger="hover"
                                                    style={{ width: "25px", height: "25px" }}>
                                                </lord-icon>
                                            </span>
                                            <span className='cursor-pointer mx-1' onClick={() => { deletePassword(item.id) }}>
                                                <lord-icon
                                                    src="https://cdn.lordicon.com/skkahier.json"
                                                    trigger="hover"
                                                    style={{ width: "25px", height: "25px" }}>
                                                </lord-icon>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};

export default Manager;
