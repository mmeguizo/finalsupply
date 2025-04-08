import Transaction from "../models/transaction.model.js";

const transactionResolver = {
  Query: {
    transactions: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        const userId = context.getUser()._id;
        const transactions = await Transaction.find({
          userId,
          isDeleted: false,
        }).sort({ date: -1 });
        return transactions;
      } catch (error) {
        console.error("Error fetching transactions, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    transaction: async (_, { transactionId }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // const userId = context.getUser()._id;
        // const transaction = await Transaction.findOne({
        const transaction = await Transaction.findOne({
          _id: transactionId,
          // userId,
        });
        return transaction;
      } catch (error) {
        console.error("Error fetching transaction, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    // TODO add category statistics resolver
    categoryStatistics: async (_, __, context) => {
      if (!context.isAuthenticated()) {
        throw new Error("Unauthorized");
      }
      const userId = context.getUser()._id;
      const transactions = await Transaction.find({
        userId,
        isDeleted: false,
      });
      const categoryMap = {};
      transactions.forEach((transaction) => {
        if (!categoryMap[transaction.category]) {
          categoryMap[transaction.category] = 0;
        }
        categoryMap[transaction.category] += transaction.amount;
      });

      // const categoryStatistics = transactions.reduce((acc, transaction) => {
      //   if (!acc[transaction.category]) {
      //     acc[transaction.category] = 0;
      //   }
      //   acc[transaction.category] += transaction.amount;
      //   return acc;
      // }, {});
      return Object.entries(categoryMap).map(([category, totalAmount]) => ({
        category,
        totalAmount,
      }));
    },
  },
  Mutation: {
    createTransaction: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        const newTransaction = new Transaction({
          ...input,
          userId: context.getUser()._id,
        });
        await newTransaction.save();
        return newTransaction;
      } catch (error) {
        console.error("Error creating transaction, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    updateTransaction: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        const { transactionId, ...update } = input;
        // const userId = context.getUser()._id;
        const updatedTransaction = await Transaction.findOneAndUpdate(
          { _id: transactionId },
          { ...update },
          { new: true }
        );
        return updatedTransaction;
      } catch (error) {
        console.error("Error updating transaction, error: ", error);
        throw new Error(error.message || "Internal server");
      }
    },

    deleteTransaction: async (_, { transactionId }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // const userId = context.getUser()._id;
        const deletedTransaction = await Transaction.findOneAndUpdate(
          { _id: transactionId },
          { isDeleted: true },
          { new: true }
        );
        return deletedTransaction;
      } catch (error) {
        console.error("Error deleting transaction, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
  },
};

export default transactionResolver;
