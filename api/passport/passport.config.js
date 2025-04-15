import passport from "passport";
import bcrypt from "bcryptjs";
import { GraphQLLocalStrategy } from "graphql-passport";
import User from "../models/user.model.js";

export const configurePassport = async () => {
  passport.serializeUser((user, done) => {
    console.log("Serializing User!...😎");
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    console.log("Deserializing User!...😍");
    try {
      const user = await User.findByPk(id); // ✅ Sequelize uses findByPk instead of findById
      if (!user) {
        return done(new Error("User not found"), null);
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new GraphQLLocalStrategy(async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email } }); // ✅ Sequelize syntax
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
};

// import passport from "passport";
// import bcrypt from "bcryptjs";

// import User from "../models/user.model.js";
// import { GraphQLLocalStrategy } from "graphql-passport";

// export const configurePassport = async () => {
//   passport.serializeUser((user, done) => {
//     console.log("Serializing User!...😎");
//     done(null, user.id);
//   });

//   passport.deserializeUser(async (id, done) => {
//     console.log("Deserializing User!...😍 ");
//     try {
//       const user = await User.findById(id);
//       done(null, user);
//     } catch (err) {
//       done(err);
//     }
//   });

//   passport.use(
//     new GraphQLLocalStrategy(async (email, password, done) => {
//       try {
//         const user = await User.findOne({ email });
//         if (!user) {
//           throw new Error("Invalid email or password");
//         }
//         const validPassword = await bcrypt.compare(password, user.password);

//         if (!validPassword) {
//           throw new Error("Invalid email or password");
//         }

//         return done(null, user);
//       } catch (err) {
//         return done(err);
//       }
//     })
//   );
// };
