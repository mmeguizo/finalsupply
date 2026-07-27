import { GraphQLError } from 'graphql';
import { Op } from 'sequelize';

export function requireAuthenticated(context) {
  if (!context.isAuthenticated()) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
    });
  }
}

export function requireRole(context, ...roles) {
  requireAuthenticated(context);
  const user = context.getUser();
  if (!user || !roles.includes(user.role)) {
    throw new GraphQLError(`Forbidden: requires one of roles [${roles.join(', ')}]`, {
      extensions: { code: 'FORBIDDEN', http: { status: 403 } },
    });
  }
}

export function getCurrentUser(context) {
  requireAuthenticated(context);
  return context.getUser();
}

function isAdmin(user) {
  return user && user.role === 'admin';
}

function isOwnerOrNull(record, user) {
  if (!record || !user) return false;
  return !record.createdBy || record.createdBy === user.email;
}

export function ownershipScope(user) {
  if (!user || !user.email) return {};
  if (isAdmin(user)) return {};
  return { [Op.or]: [{ createdBy: user.email }, { createdBy: null }] };
}

export function authorizeOwnership(record, context) {
  const user = context.getUser();
  if (!record) {
    throw new GraphQLError('Record not found', {
      extensions: { code: 'NOT_FOUND', http: { status: 404 } },
    });
  }
  if (isAdmin(user)) return record;
  if (isOwnerOrNull(record, user)) return record;
  throw new GraphQLError('Forbidden: you do not own this record', {
    extensions: { code: 'FORBIDDEN', http: { status: 403 } },
  });
}

export async function authorizeOwnershipBatch(Model, ids, context) {
  const user = context.getUser();
  if (!ids || ids.length === 0) {
    throw new GraphQLError('No IDs provided', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  const records = await Model.findAll({
    where: { id: { [Op.in]: ids } },
  });
  if (records.length !== ids.length) {
    throw new GraphQLError('One or more records not found', {
      extensions: { code: 'NOT_FOUND', http: { status: 404 } },
    });
  }
  if (isAdmin(user)) return records;
  for (const record of records) {
    if (!isOwnerOrNull(record, user)) {
      throw new GraphQLError('Forbidden: you do not own one or more records', {
        extensions: { code: 'FORBIDDEN', http: { status: 403 } },
      });
    }
  }
  return records;
}
