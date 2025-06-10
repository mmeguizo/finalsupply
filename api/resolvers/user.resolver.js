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

    editUser: async (_, { input }, context) => {
      try {
        console.log("input editUser", input);
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const { id, ...updateFields } = input;

        if (!id) {
          // Should be caught by GraphQL schema if id is ID!
          throw new Error("User ID is required for an update.");
        }

        const userToUpdate = await User.findByPk(id);
        if (!userToUpdate) {
          throw new Error("User not found to update.");
        }

        const dataToUpdate = {};

        // Handle email update and uniqueness
        if (updateFields.email !== undefined) {
          if (updateFields.email.trim() === "") {
            throw new Error("Email cannot be empty.");
          }
          if (updateFields.email !== userToUpdate.email) {
            const existingUserWithNewEmail = await User.findOne({ where: { email: updateFields.email } });
            if (existingUserWithNewEmail) {
              throw new Error("Email already in use by another account.");
            }
            dataToUpdate.email = updateFields.email;
          }
        }

        // Handle password update
        if (updateFields.password) {
          if (!updateFields.confirm_password) {
            throw new Error("Confirm password is required when changing password.");
          }
          if (updateFields.password !== updateFields.confirm_password) {
            throw new Error("Passwords do not match.");
          }
          // Optional: Add password complexity validation here
          const salt = bcrypt.genSaltSync(10);
          dataToUpdate.password = bcrypt.hashSync(updateFields.password, salt);
        } else if (updateFields.confirm_password && !updateFields.password) {
          throw new Error("Password is required when confirm password is provided.");
        }

        // Prepare other updatable fields
        ['name', 'last_name', 'employee_id', 'department', 'position', 'gender', 'role'].forEach(field => {
          if (updateFields[field] !== undefined) {
            if ((field === 'name' || field === 'gender') && String(updateFields[field]).trim() === "") {
                 throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} cannot be empty.`);
            }
            dataToUpdate[field] = updateFields[field];
          }
        });

        // Update profile picture if gender or email (used in URL) is changing
        const finalEmailForAvatar = dataToUpdate.email || userToUpdate.email;
        const finalGenderForAvatar = dataToUpdate.gender || userToUpdate.gender;
        if (dataToUpdate.gender !== undefined || (dataToUpdate.email !== undefined && dataToUpdate.email !== userToUpdate.email)) {
            const boyProfilePic = `https://avatar.iran.liara.run/public/boy?email=${finalEmailForAvatar}`;
            const girlProfilePic = `https://avatar.iran.liara.run/public/girl?email=${finalEmailForAvatar}`;
            const othersProfilePic = `https://avatar.iran.liara.run/public/boy?username=${finalEmailForAvatar}`;
            dataToUpdate.profile_pic = finalGenderForAvatar === "male" ? boyProfilePic : finalGenderForAvatar === "female" ? girlProfilePic : othersProfilePic;
        }

        if (Object.keys(dataToUpdate).length === 0) {
          // No actual changes submitted
          return userToUpdate;
        }

        await User.update(dataToUpdate, { where: { id } });
        return await User.findByPk(id); // Fetch and return the updated user

      } catch (error) {
        console.error("Error updating user, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    createUser: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const {
          email,
          name,
          last_name,
          password,
          confirm_password,
          gender,
          employee_id,
          department,
          position,
          role,
        } = input;

        // Basic validation
        if (!email || !name || !last_name || !password || !confirm_password || !gender || !employee_id || !department || !position || !role) {
          throw new Error("All fields are required.");
        }

        if (password !== confirm_password) {
          throw new Error("Passwords do not match.");
        }

        // Optional: Add server-side password complexity validation here
        // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
        // if (!passwordRegex.test(password)) {
        //   throw new Error("Password does not meet complexity requirements.");
        // }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          throw new Error("User with this email already exists.");
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?email=${email}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?email=${email}`;
        const othersProfilePic = `https://avatar.iran.liara.run/public/boy?username=${email}`; // Or use a generic one

        const newUser = await User.create({
          email,
          name,
          last_name,
          password: hashedPassword,
          gender,
          employee_id,
          department,
          position,
          role,
          profile_pic: gender === "male" ? boyProfilePic : gender === "female" ? girlProfilePic : othersProfilePic,
          // is_active defaults to true in the model
        });

        return newUser;
      } catch (error) {
        console.error("Error creating user, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    deleteUser: async (_, { userId }, context) => {

      console.log("userId", userId);

      try {
        // Check if the user is authenticated
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        // Find the user by ID
        const user = await User.findByPk(userId);
        if (!user) {
          throw new Error("User not found");
        }

        // Soft delete the user by setting is_active to false
        user.is_active = false;
        await user.save();

        return user; // Return the updated user object
      } catch (error) {
        console.error("Error deleting user, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    }
  },

  Query: {
    users: async (_, __, context) => {
      // Check if the user is authenticated
      if (!context.isAuthenticated()) {
        throw new Error("Unauthorized");
      }

      // Fetch all users
      return await User.findAll({
        where : {
          is_active: true // Assuming you have an isActive field to filter active users
        }
      });
    },

    countAllUsers: async (_, __, context) => {
      try {
        // Check if the user is authenticated
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Count all users
        return await User.count();
      } catch (error) {
        console.error("Error fetching all users, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
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
