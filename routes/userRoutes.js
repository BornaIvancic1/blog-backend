const express= require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth'); // <-- Make sure folder is 'middlewares', not 'middleware'

router.post('/register',userController.register);
router.post('/login',userController.login);
router.patch('/update', authenticate, userController.updateUser);

module.exports=router;