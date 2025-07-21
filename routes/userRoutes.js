const express= require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth'); 

router.post('/register',userController.register);
router.post('/login/google', userController.loginWithGoogle);
router.post('/login/github', userController.loginWithGitHub);
router.post('/login',userController.login);
router.patch('/update', authenticate, userController.updateUser);
router.get('/search', authenticate, userController.searchUsers);
router.get('/:id', authenticate, userController.getUser);

module.exports=router;