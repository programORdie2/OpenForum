interface User {
    username: string;
    email: string;
    password: string;
    userId: string;
}

interface Database {
    users: {
        [key: string]: User;
    };
}

const database: Database = {
    users: {}
};

export default database