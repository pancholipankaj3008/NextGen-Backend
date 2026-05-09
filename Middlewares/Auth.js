let jwt = require("jsonwebtoken");

function Auth(...roles){

    return (req, res, next)=>{
        try {
            

            let token = req.cookies.accessToken;

            if(!token) return res.json({success: false, message: "Unauthorized User"});

            let decoded = jwt.verify(token, process.env.ACCESS);

            if(!roles.includes(decoded.role)){
                return res.json({success: false, message: "Unauthorized User"});
            }

            req.id = decoded.id;
            req.role = decoded.role;

            next();


        } catch (error) {
            try {
                if(error.message === "jwt expired"){
                    let refreshToken = req.cookies.REFRESH;

                    if(!refreshToken) return res.json({success: false, message:"Refresh Token not found"})
                }

                let decoded = jwt.verify(refreshToken, process.env.REFRESH);

                if(!roles.includes(decoded.role)){
                    return res.json({success: false, message: "Unauthorized User"})
                }

                let newAccessToken = jwt.sign({id: decoded.id, role: decoded.role}, process.env.ACCESS, {expiresIn: "15m"});

                res.cookie("accessToken", newAccessToken,{
                        httpOnly: true,
                        secure: false,
                        maxAge: 15 * 60 * 1000
                    });

                    req.id = decoded.id;
                    req.role = decoded.role;

                    next();
            } catch (error2) {
                return res.json({success: false, message:error2.message});
            }
        }
    }
}


module.exports = {Auth};