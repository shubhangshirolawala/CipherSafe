import React from 'react'
import { useAuth0 } from "@auth0/auth0-react";
const Navbar = () => {
    const { user, isAuthenticated, isLoading } = useAuth0();

    const LoginButton = () => {
        const { loginWithRedirect } = useAuth0();
      
        return <button className='text-white bg-blue-700  my-5 mx-2 rounded-lg flex justify-center items-center ring-white ring-1' style={{ width: '70px' ,height:'30px'}} onClick={() => loginWithRedirect()}>Log In</button>;
      };


      const LogoutButton = () => {
        const { logout } = useAuth0();
      
        return (
          <button className='text-white bg-blue-700  my-5 mx-2 rounded-lg flex justify-center items-center ring-white ring-1' style={{ width: '70px' ,height:'30px'}} onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            Log Out
          </button>
        );
      };



    const Button=()=>{
        if(!isAuthenticated)
        return (
            <LoginButton/>
          );
          else
          return(
          <LogoutButton/>
        )
          

    }
    return (
        <nav className='bg-slate-800 text-white '>
            <div className="mycontainer flex justify-between items-center px-4 py-5 h-14">

                <div className="logo font-bold text-white text-2xl">
                    {/* <span className='text-blue-500'> &lt;</span> */}
                   
                    <span>CipherSafe</span>
                  
                    
                    </div>
                {/* <ul>
                    <li className='flex gap-4 '>
                        <a className='hover:font-bold' href='/'>Home</a>
                        <a className='hover:font-bold' href='#'>About</a>
                        <a className='hover:font-bold' href='#'>Contact</a>
                    </li>
                </ul> */}
             <Button/>


            </div>
        </nav>
    )
}

export default Navbar
