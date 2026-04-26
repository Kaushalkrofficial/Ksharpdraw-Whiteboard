import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import NextAuth from "next-auth"
// import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        // GithubProvider({
        //     clientId: process.env.GITHUB_ID,
        //     clientSecret: process.env.GITHUB_SECRET,
        // }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
        // ...add more providers here
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            console.log("THis is token : ", token)
            console.log("user :", user);
            console.log("accont :", account);
            if (user) {
                token.id = user.id;
            }
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            return session
        },
        async signIn({ user, profile }) {
            try {
                await dbConnect();
                
                // if (!user?.email) return false;

                let dbUser = await User.findOne({ email: user.email });

                if (!dbUser) {
                    dbUser = await User.create({
                        name: user.name || profile?.name || "User",
                        email: user.email,
                        profilePicture: user.image || profile?.picture || "",
                        isVerified: profile?.email_verified ?? true
                    });
                }
                
                user.id = dbUser._id.toString();
                return true;

            } catch (error) {
                console.log("SIGNIN ERROR:", error);
                return false;
            }
        }
    },
    session: {
        strategy: 'jwt',
        maxAge: 90 * 24 * 60 * 60
    },
    pages: {
        signIn: '/user-auth'
    }
}
const handle = NextAuth(authOptions)
export { handle as POST, handle as GET };
// export default NextAuth(authOptions)