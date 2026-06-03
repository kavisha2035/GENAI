import React from 'react'

function Register() {
  return (
    <main>
      <div className="form-container">
        <h1>Create an Account</h1>

        <form>
          {/* Name Field */}
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" name="name" placeholder='Enter your full name' />
          </div>

          {/* Email Field */}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" placeholder='Enter email address' />
          </div>
          
          {/* Password Field */}
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" placeholder='Create a password' />
          </div>
        </form>
      </div>
    </main>
  )
}

export default Register
