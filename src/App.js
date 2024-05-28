import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Expense from './Expense';

const App = () => {
  return (
    <Router>
        <Routes>
          <Route exact path="/" element={<Login/>} />
          <Route exact path="/Signup" element={<Signup/>}/>
          <Route exact path="/Expense" element={<Expense/>} />
        </Routes>
    </Router>
  );
};

export default App;
