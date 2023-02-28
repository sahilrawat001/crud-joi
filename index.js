
const http = require("http");
const fs = require("fs");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const querystring = require("querystring");
let secret = "1XAIX69DXLFND[P823";

let data = require("./db.json");


// schema created with joi
const schema = Joi.object().keys({
    username: Joi.string().min(4).required(),
    email: Joi.string().email({ tlds: { allow: ['com', 'in', 'net'] } }).lowercase(),
    password: Joi.string().min(8).max(20).required(),
    age: Joi.number().integer().greater(18).required()

});

http.createServer(
    function (req, res) {
        res.writeHead(202, { 'Content-type': 'text/html' });

        console.log(req.url);
        if (req.url == "/signup") {


            let dt = "";
            req.on('data', (d) => {
                dt += d;

            })

            req.on('end', (d) => {

                // changing to object 
                dt = JSON.parse(dt);

                // data validation using joi
                const result = schema.validate({ username: dt.username, age: dt.age, email: dt.mail, password: dt.password });

                // if given data did not fullfill the  validation condition
                if (result.error) {
                    console.log(" validation error");
                    res.end(" erorrr due to validation");
                }


                // validation conditions accepted
                else {

                    // email in lowercase
                    let lowerMail = result.value.email;

                    dt.mail = lowerMail;
                    let checkmail = data.some((i) => {
                        return i.mail == dt.mail;
                    })
                    console.log(checkmail);

                    if (!checkmail) {


                        let nIndex = 0;
                        data.forEach((i) => {
                            if (nIndex < i.id) {
                                nIndex = i.id;
                            }

                        });
                        dt.id = nIndex + 1;
                        console.log(dt);
                        data.push(dt);
                        let token = jwt.sign(dt, secret);

                        data = JSON.stringify(data);
                        fs.writeFile("db.json", data, "utf-8", function (err) {
                            console.log('added sucessfully');
                        })
                        res.end(JSON.stringify({ token: token }));
                    }

                    else {
                        console.log("already present");
                        res.end("already present");

                    }
                }
            })


        }



        if (req.url == "/signin") {


            //data from json api input
            let dt = "";
            req.on('data', (d) => {
                dt += d;

            })

            req.on('end', (d) => {

                // changing to object 
                dt = JSON.parse(dt);
                console.log(dt.mail, "----");
                let dmail = dt.mail;
                let dpass = dt.password;
                let checkmail = data.some((i) => {
                    return i.mail == dmail;
                })
                let checkpass = data.some((i) => {
                    return i.password == dpass;
                })
                console.log(checkmail, "----");
                let auth = checkpass && checkmail;

                // adding id for new index
                if (!auth) {
                    return res.end(JSON.stringify({ status: false, msg: 'Auth is required' }))
                }

                else {
                    let resultData = data.filter((i) => {
                        return i.mail == dmail;
                    })
                    console.log(resultData);
                    resultData = JSON.stringify(resultData);
                    let token = jwt.sign(resultData, secret);

                    res.end(JSON.stringify({ token: token }));

                }

            })
            //  res.end('Auth is required');
        }


        // shows data
        if (req.url.includes("/getdata")) {
            let obj = querystring.parse(req.url.slice(req.url.indexOf("?") + 1), "&", "=");
            console.log(obj);
            let [skip, limit] = [obj.skip, obj.limit];

            let endIndex = Number(skip) + Number(limit);

            let resData;



            // method using filter
            let count = 0;
            resData = data.filter((i) => {
                ++count; return check = count <= endIndex && count > skip;
            });





            //method using slice

            // console.log(endIndex);
            //       resData=data.slice(skip,endIndex );
            //     console.log(resData);





            // method using loop


            // let r2=[];
            // let count2=0;  
            //  for(let i=skip;i<data.length;i++ ){
            //     if(count2<limit){
            //         console.log(count2);
            //     r2.push( data[i] );
            // }
            // else{
            //     break; 

            // }
            //     count2++;
            //  }
            // console.log(r2);
            console.log(resData);
            res.end(JSON.stringify(resData));
        }


        //update info 
        if (req.url.includes("upinfo")) {
            let useresultData = jwt.verify(req.headers.token, secret);
            useresultData = useresultData[0];
            let dt = "";
            req.on('data', (d) => {
                dt += d;

            })

            req.on('end', (d) => {
                dt = JSON.parse(dt);

                if (dt.id != useresultData.id) {
                    console.log(" can't update");
                    res.end("you can't update data");
                }
                else {
                    const result = schema.validate({ username: dt.username, age: dt.age, email: dt.mail, password: dt.password });
                    // if given data did not fullfill the  validation condition
                    if (result.error) {
                        console.log(" cant update");
                        res.end(" can't update due to validation");
                    }


                    // validation conditions accepted
                    else {

                        // email in lowercase
                        let lowerMail = result.value.email;

                        dt.mail = lowerMail;
                        let reqData = data.filter((i) => i.id != dt.id);
                        useresultData.username = dt.username;
                        useresultData.age = dt.age;
                        useresultData.mail = dt.mail;
                        useresultData.password = dt.password;

                        console.log(useresultData);
                        reqData.push(useresultData);
                        reqData = JSON.stringify(reqData);
                        fs.writeFile("db.json", reqData, "utf-8", function (err) {
                            console.log('added assignable sucessfully');
                        });
                        res.end(" updated data successfully");
                    }
                }
            })

        }




    }).listen(6000, () => {
        console.log('Server started')
    }); 