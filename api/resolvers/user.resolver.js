import bcrypt from "bcryptjs";
import User from "../models/user.model.js"; // Import your Sequelize model

const userResolver = {
  Mutation: {
    signUp: async (_, { input }, context) => {
      try {
        const { email, name, password, gender } = input;
        if (!email || !name || !password || !gender) {
          throw new Error("All fields are required");
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          throw new Error("User already exists");
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const boyprofile_pic = `https://avatar.iran.liara.run/public/boy?email=${email}`;
        const girlprofile_pic = `https://avatar.iran.liara.run/public/girl?email=${email}`;

        // Create new user using Sequelize
        const newUser = await User.create({
          email,
          name,
          password: hashedPassword,
          gender,
          profile_pic: gender === "male" ? boyprofile_pic : girlprofile_pic,
        });

        return newUser;
      } catch (error) {
        console.error("Error creating user, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    login: async (_, { input }, context) => {
      try {
        const { email, password } = input;
        if (!email || !password) {
          throw new Error("All fields are required");
        }

        // Find user in the database
        const user = await User.findOne({ where: { email } });
        if (!user) {
          throw new Error("User not found");
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new Error("Invalid credentials");
        }

        await context.login(user); // Handle login
        return user;
      } catch (error) {
        console.error("Error logging in user, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    logout: async (_, __, context) => {
      let message = [];
      try {
        await context.logout();
        context.req.session.destroy((err) => {
          console.error("Error destroying session, error: ", err);
        });
        context.res.clearCookie("connect.sid");
        return { message: "Logged out successfully" };
      } catch (error) {
        console.error("Error logging out user, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    updateUser: async (_, { input }, context) => {
      try {
        const { userId, ...update } = input;

        // Update user data in the database
        const updatedUser = await User.update(update, {
          where: { id: userId },
          returning: true, // Fetch the updated user
        });

        if (!updatedUser[0]) {
          throw new Error("User not found");
        }

        return updatedUser[1][0]; // Return the updated user object
      } catch (error) {
        console.error("Error updating user, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
  },

  Query: {
    users: async (_, __, context) => {
      // Check if the user is authenticated
      if (!context.isAuthenticated()) {
        throw new Error("Unauthorized");
      }

      // Fetch all users
      return await User.findAll();
    },

    authUser: async (_, __, context) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (error) {
        console.error("Error fetching authenticated user, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    user: async (_, { userId }, context) => {
      try {
        // Check if the user is authenticated
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        // Fetch user by ID
        return await User.findByPk(userId);
      } catch (error) {
        console.error("Error fetching user, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
  },
};

export default userResolver;

// import User from "../models/user.model.js";
// import bcrypt from "bcryptjs";

// const userResolver = {
//   Mutation: {
//     signUp: async (_, { input }, context) => {
//       try {
//         const { email, name, password, gender } = input;
//         if (!email || !name || !password || !gender) {
//           throw new Error("All fields are required");
//         }
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//           throw new Error("User already exists");
//         }

//         const salt = bcrypt.genSaltSync(10);
//         const hashedPassword = bcrypt.hashSync(password, salt);

//         const boyprofile_pic = `https://avatar.iran.liara.run/public/boy?email=${email}`;
//         const girlprofile_pic = `https://avatar.iran.liara.run/public/girl?email=${email}`;

//         const newUser = new User({
//           email,
//           name,
//           password: hashedPassword,
//           gender,
//           profile_pic: gender === "male" ? boyprofile_pic : girlprofile_pic,
//         });
//         const savedUser = await newUser.save();

//         // await context.login(savedUser);
//         return savedUser;
//       } catch (error) {
//         console.error("Error creating user, error: ", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//     login: async (_, { input }, context) => {
//       console.log("input", input);

//       try {
//         const { email, password } = input;
//         // const { email, password } = input;
//         if (!email || !password) {
//           throw new Error("All fields are required");
//         }
//         const { user } = await context.authenticate("graphql-local", {
//           email,
//           password,
//         });
//         await context.login(user);
//         return user;
//       } catch (error) {
//         console.error("Error logging in user, error: ", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//     logout: async (_, __, context) => {
//       let message = [];
//       try {
//         await context.logout();
//         context.req.session.destroy((err) => {
//           console.error("Error destroying session, error: ", err);
//         });
//         context.res.clearCookie("connect.sid");
//         return { message: "Logged out successfully" };
//       } catch (error) {
//         console.error("Error logging out user, error: ", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//     updateUser: async (_, { input }, context) => {
//       try {
//         const { userId, ...update } = input;
//         const updatedUser = await User.findByIdAndUpdate(userId, update, {});
//         return updatedUser;
//       } catch (error) {
//         console.error("Error updating user, error: ", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//   },
//   Query: {
//     users: async (_, __, context) => {
//       // const users = await User.find({});
//       // return users;
//       if (!context.isAuthenticated()) {
//         throw new Error("Unauthorized");
//       }

//       return await User.find({});
//     },
//     authUser: async (_, __, context) => {
//       try {
//         const user = await context.getUser();
//         return user;
//       } catch (error) {
//         console.error("Error fetching authenticated user, error: ", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//     user: async (_, { userId }, context) => {
//       try {
//         if (!context.isAuthenticated()) {
//           throw new Error("Unauthorized");
//         }
//         return User.findById(userId);
//       } catch (error) {
//         console.error("Error fetching user, error: ", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//     //  TODO => ADD USER/TRANSACTION RELATIONSHIP
//   },
// };

// export default userResolver;
