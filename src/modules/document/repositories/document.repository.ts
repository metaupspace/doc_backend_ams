import Document from '../models/document.model.ts';
import mongoose from 'mongoose';

export const createDocument = (data) => Document.create(data);

export const saveDocument = (documentRecord) => documentRecord.save();

const escapeRegex = (input) => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const findDocuments = async ({ filters, search, page, limit }) => {
  const skip = (page - 1) * limit;
  const trimmedSearch = search?.trim();
  const pipeline: any[] = [{ $match: filters }];

  if (trimmedSearch) {
    const safeSearch = escapeRegex(trimmedSearch);
    const searchRegex = new RegExp(safeSearch, 'i');
    pipeline.push({
      $match: {
        $or: [
          { employeeId: searchRegex },
          { employeeName: searchRegex },
          { hrName: searchRegex },
          { documentType: searchRegex },
          { 'payload.employeeName': searchRegex },
          { 'payload.hrName': searchRegex },
        ],
      },
    });
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        documents: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              documentIdentifier: 1,
              documentType: 1,
              employeeId: 1,
              employeeName: 1,
              hrId: 1,
              hrName: 1,
              managerId: 1,
              status: 1,
              fileName: 1,
              fileSize: 1,
              generationTime: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        totalCount: [{ $count: 'value' }],
      },
    }
  );

  const [result] = await Document.aggregate(pipeline).allowDiskUse(true);
  const documents = result?.documents || [];
  const total = result?.totalCount?.[0]?.value || 0;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

  return {
    documents,
    page,
    limit,
    total,
    totalPages,
  };
};

export const findDocumentById = (id) => Document.findById(id).exec();

const OFFER_DOCUMENT_TYPES = ['offer-letter', 'probation-offer-letter', 'contractual-letter'];

export const findSuccessfulOfferLetterForEmployee = ({ employeeId, offerLetterDocumentId }) => {
  const filters: Record<string, any> = {
    employeeId,
    documentType: { $in: OFFER_DOCUMENT_TYPES },
    status: 'success',
  };

  if (offerLetterDocumentId) {
    filters._id = offerLetterDocumentId;
  }

  return Document.findOne(filters).sort({ createdAt: -1 }).lean();
};

const EMPLOYEE_COLLECTIONS = ['employees'];

export const findActiveEmployeeByEmployeeId = async (employeeId) => {
  if (!employeeId || !mongoose.connection?.db) {
    return null;
  }

  for (const collectionName of EMPLOYEE_COLLECTIONS) {
    const employee = await mongoose.connection.db.collection(collectionName).findOne({
      employeeId,
      active: { $ne: false },
    });

    if (employee) {
      return employee;
    }
  }

  return null;
};
