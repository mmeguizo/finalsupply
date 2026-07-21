import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { getCurrentUser, requireAuthenticated, requireRole } from '../auth/authorization.js';

const userResolver = {
  Mutation: {
    signUp: async (_, { input }, context) => {
      requireRole(context, 'admin');
      try {
        const { email, name, password, gender } = input;
        if (!email || !name || !password || !gender) {
          throw new Error('All fields are required');
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          throw new Error('User already exists');
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const newUser = await User.create({
          email,
          name,
          password: hashedPassword,
          gender,
          profile_pic: `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`,
          role: 'user',
        });

        return newUser;
      } catch (error) {
        console.error('Error creating user, error: ', error);
        throw new Error(error.message || 'Internal server error');
      }
    },

    login: async (_, { input }, context) => {
      try {
        const { email, password } = input;
        if (!email || !password) {
          throw new Error('All fields are required');
        }

        // Find user in the database
        const user = await User.findOne({ where: { email } });
        if (!user) {
          throw new Error('User not found');
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new Error('Invalid credentials');
        }

        await context.login(user); // Handle login
        return user;
      } catch (error) {
        console.error('Error logging in user, error: ', error);
        throw new Error(error.message || 'Internal server error');
      }
    },

    logout: async (_, __, context) => {
      let message = [];
      try {
        await context.logout();
        context.req.session.destroy((err) => {
          console.error('Error destroying session, error: ', err);
        });
        context.res.clearCookie('connect.sid');
        return { message: 'Logged out successfully' };
      } catch (error) {
        console.error('Error logging out user, error: ', error);
        throw new Error(error.message || 'Internal server error');
      }
    },

    editUser: async (_, { input }, context) => {
      requireAuthenticated(context);
      try {
        const currentUser = context.getUser();
        const { id, ...updateFields } = input;

        if (!id) {
          throw new Error('User ID is required for an update.');
        }

        const userToUpdate = await User.findByPk(id);
        if (!userToUpdate) {
          throw new Error('User not found to update.');
        }

        const isSelf = Number(currentUser.id) === Number(id);
        const isAdmin = currentUser.role === 'admin';

        if (!isSelf && !isAdmin) {
          throw new Error('Forbidden: you can only edit your own profile.');
        }

        const dataToUpdate = {};

        if (updateFields.email !== undefined) {
          if (updateFields.email.trim() === '') {
            throw new Error('Email cannot be empty.');
          }
          if (updateFields.email !== userToUpdate.email) {
            const existingUserWithNewEmail = await User.findOne({
              where: { email: updateFields.email },
            });
            if (existingUserWithNewEmail) {
              throw new Error('Email already in use by another account.');
            }
            dataToUpdate.email = updateFields.email;
          }
        }

        if (updateFields.password) {
          if (!updateFields.confirm_password) {
            throw new Error('Confirm password is required when changing password.');
          }
          if (updateFields.password !== updateFields.confirm_password) {
            throw new Error('Passwords do not match.');
          }
          if (isSelf && !updateFields.current_password) {
            throw new Error('Current password is required to change your own password.');
          }
          if (isSelf) {
            const isMatch = await bcrypt.compare(updateFields.current_password, userToUpdate.password);
            if (!isMatch) {
              throw new Error('Current password is incorrect.');
            }
          }
          const salt = bcrypt.genSaltSync(10);
          dataToUpdate.password = bcrypt.hashSync(updateFields.password, salt);
        } else if (updateFields.confirm_password && !updateFields.password) {
          throw new Error('Password is required when confirm password is provided.');
        }

        const selfFields = ['name', 'last_name', 'employee_id', 'gender'];
        const adminFields = ['department', 'position', 'role', 'location'];

        for (const field of selfFields) {
          if (updateFields[field] !== undefined) {
            if (String(updateFields[field]).trim() === '') {
              throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} cannot be empty.`);
            }
            dataToUpdate[field] = updateFields[field];
          }
        }

        for (const field of adminFields) {
          if (updateFields[field] !== undefined) {
            if (!isAdmin) {
              throw new Error(`Forbidden: only admins can change ${field}.`);
            }
            dataToUpdate[field] = updateFields[field];
          }
        }

        if (
          dataToUpdate.email !== undefined && dataToUpdate.email !== userToUpdate.email
        ) {
          dataToUpdate.profile_pic = `https://api.dicebear.com/9.x/avataaars/svg?seed=${dataToUpdate.email}`;
        }

        if (Object.keys(dataToUpdate).length === 0) {
          return userToUpdate;
        }

        await User.update(dataToUpdate, { where: { id } });
        return await User.findByPk(id);
      } catch (error) {
        console.error('Error updating user, error: ', error);
        throw new Error(error.message || 'Internal server error');
      }
    },
    createUser: async (_, { input }, context) => {
      requireRole(context, 'admin');
      try {
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
          location,
        } = input;

        if (
          !email ||
          !name ||
          !last_name ||
          !password ||
          !confirm_password ||
          !gender ||
          !employee_id ||
          !department ||
          !position ||
          !location
        ) {
          throw new Error('All fields are required.');
        }

        if (password !== confirm_password) {
          throw new Error('Passwords do not match.');
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          throw new Error('User with this email already exists.');
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const newUser = await User.create({
          email,
          name,
          last_name,
          password: hashedPassword,
          gender,
          employee_id,
          department,
          position,
          role: role || 'user',
          profile_pic: `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`,
          location,
        });

        return newUser;
      } catch (error) {
        console.error('Error creating user, error: ', error);
        throw new Error(error.message || 'Internal server error');
      }
    },

    deleteUser: async (_, { userId }, context) => {
      requireRole(context, 'admin');
      try {
        const user = await User.findByPk(userId);
        if (!user) {
          throw new Error('User not found');
        }

        user.is_active = false;
        await user.save();

        return user;
      } catch (error) {
        console.error('Error deleting user, error: ', error);
        throw new Error(error.message || 'Internal server error');
      }
    },
  },

  Query: {
    users: async (_, __, context) => {
      requireRole(context, 'admin', 'user');
      return await User.findAll({
        where: { is_active: true },
      });
    },

    countAllUsers: async (_, __, context) => {
      requireRole(context, 'admin', 'user');
      try {
        return await User.count({ where: { is_active: true } });
      } catch (error) {
        console.error('Error fetching all users, error: ', error);
        throw new Error(error.message || 'Internal server error');
      }
    },

    authUser: async (_, __, context) => {
      try {
        return await context.getUser();
      } catch (error) {
        console.error('Error fetching authenticated user, error: ', error);
        throw new Error(error.message || 'Internal server error');
      }
    },

    user: async (_, { userId }, context) => {
      requireAuthenticated(context);
      try {
        return await User.findByPk(userId);
      } catch (error) {
        console.error('Error fetching user, error: ', error);
        throw new Error(error.message || 'Internal server error');
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

//         const boyprofile_pic = `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`;
//         const girlprofile_pic = `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`;

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
