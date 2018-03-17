import axios from 'axios';
import mockUsers from 'model/mock.json';

export async function getUsers() {
    const url = "https://jsonplaceholder.typicode.com/users";
    return axios.get(url).then((res) => {
        return Promise.resolve(res.data);
    })
}

export async function getMockUsers() {
    return mockUsers;
}

export async function getTodos() {
    const url = "http://jsonplaceholder.typicode.com/todos";
    return axios.get(url).then((res) => {
        return Promise.resolve(res.data);
    });
}