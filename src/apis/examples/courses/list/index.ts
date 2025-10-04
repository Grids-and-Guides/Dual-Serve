
import { courseList } from '@/services/course/list-course';
import { Handler } from 'aws-lambda';


export const handler: Handler = async (event, context) => {
    // console.log('EVENT: \n' + JSON.stringify(event, null, 2));
    const list = courseList();
    console.log("env", process.env.frontendUrl);
    return { statusCode: 200, body: list};
};

