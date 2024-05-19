class ApiResponse{
    constructor(statusCode , massage ,data){
        this.statusCode  = statusCode
        this.massage = "success"
        this .data = data
        this.success = statusCode<400
    }
}
export {ApiResponse}