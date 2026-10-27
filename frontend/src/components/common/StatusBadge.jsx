import React from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  DollarSign,
  UserCheck,
  XCircle,
  FileCheck
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'SUBMITTED':
    case 'DRAFT':
    case 'PENDING':
      return (
        <span className="badge badge-pending">
          <Clock size={12} /> {status}
        </span>
      );

    case 'VERIFIED':
      return (
        <span className="badge badge-verified">
          <FileCheck size={12} /> VERIFIED
        </span>
      );

    case 'ALLOTTED':
      return (
        <span className="badge badge-allotted">
          <Award size={12} /> ALLOTTED
        </span>
      );

    case 'PAID':
    case 'COMPLETED':
      return (
        <span className="badge badge-paid">
          <DollarSign size={12} /> {status}
        </span>
      );

    case 'JOINED':
    case 'ADMITTED':
      return (
        <span className="badge badge-joined">
          <UserCheck size={12} /> ADMITTED
        </span>
      );

    case 'DISCREPANT':
      return (
        <span className="badge badge-discrepant">
          <AlertCircle size={12} /> DISCREPANT
        </span>
      );

    case 'CANCELLED':
    case 'REJECTED':
    case 'FAILED':
      return (
        <span className="badge badge-cancelled">
          <XCircle size={12} /> {status}
        </span>
      );

    default:
      return (
        <span className="badge badge-pending">
          {status}
        </span>
      );
  }
};

export default StatusBadge;
