/**
 * loan-application controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::loan-application.loan-application',
  ({ strapi }) => ({
    async create(ctx) {
      const { data } = ctx.request.body as { data: Record<string, any> };
      const { branch: branchDocId, loan: loanDocId, ...rest } = data ?? {};

      const relations: Record<string, any> = {};

      if (branchDocId) {
        const branch = await strapi
          .documents('api::branch.branch')
          .findOne({ documentId: branchDocId });
        if (branch) {
          relations.branch = { connect: [{ documentId: branchDocId }] };
        }
      }

      if (loanDocId) {
        const loan = await strapi
          .documents('api::loan.loan')
          .findOne({ documentId: loanDocId });
        if (loan) {
          relations.loan = { connect: [{ documentId: loanDocId }] };
        }
      }

      const entry = await strapi
        .documents('api::loan-application.loan-application')
        .create({
          data: {
            ...rest,
            ...relations,
          },
          status: 'published',
        });

      return this.transformResponse(entry);
    },
  })
);
