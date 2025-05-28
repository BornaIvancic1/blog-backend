const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
 firstName: {type: String, required:true},
 lastName: {type: String, required: true},
 userName: {type: String, required: true, unique: true},
 password: {type: String, required: true}
});

userSchema.pre('save', async function(next) {
                if(!this.modified('password')) return next();
                this.password=await bcrypt.hash(this.password, 10);
                next();
});

userSchema.methods.comparePassword = function(password){
return bcrypt.compare(password,this.password);
};

module.exports=mongoose.model('User', userSchema);