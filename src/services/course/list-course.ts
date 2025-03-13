import moment from "moment";

export function courseList(){
    console.log("env", process.env.env )
    return ["course 1", "course 2", moment().format('MMMM Do YYYY, h:mm:ss a')];
}