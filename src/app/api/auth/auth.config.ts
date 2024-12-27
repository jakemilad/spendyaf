import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { neon } from "@neondatabase/serverless";
import { DEFAULT_CATEGORIES } from "@/app/utils/dicts";

const sql = neon(process.env.DATABASE_URL!);

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: '/auth/signin',
    },
    // events: {
    //     signIn: async ({ user }) => {
    //         if(user.email) {
    //             const existingCategories = await sql`
    //                 SELECT categories
    //                 FROM user_categories
    //                 WHERE user_id = ${user.email}
    //             `;
    //             if(existingCategories.length === 0) {
    //                 await sql`
    //                     INSERT INTO user_categories (user_id, categories)
    //                     VALUES (${user.email}, ${DEFAULT_CATEGORIES})
    //                 `;
    //             }
    //         }
    //     },
    // },
};
