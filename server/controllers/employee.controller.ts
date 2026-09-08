import { catchAsyncError } from "../middlewares/catchAsyncErrors";
import { NextFunction, Request, Response } from "express";
import Employee from "../models/Employee";
import ErrorHandler from "../utils/errorHandler";
import { UserRole } from "../models/User";

/**
 * Resolves which company's data a request should be scoped to.
 * super_admin may pass ?company=<id> to inspect a specific tenant;
 * everyone else is locked to their own company from the JWT.
 */
const resolveCompanyScope = (req: Request): string | undefined => {
  if (!req.user) {
    return undefined;
  }

  // Super admin can explicitly select a company.
  if (req.user.role === UserRole.SUPER_ADMIN) {
    return (
      (req.query.company as string) ||
      (req.params.companyId as string) ||
      req.body?.company
    );
  }

  // All other users are strictly scoped to their own company.
  return req.user.company?.toString();
};

/**
 * @desc    Create an employee
 * @route   POST /api/employees
 * @access  Private (company_admin, hr)
 */
export const createEmployee = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = resolveCompanyScope(req);
    if (!company) {
      return next(new ErrorHandler("company is required", 400));
    }

    const employee = await Employee.create({ ...req.body, company });
    res.status(201).json({ success: true, employee });
  },
);

/**
 * @desc    List employees for the caller's company, with basic filtering/pagination
 * @route   GET /api/employees?status=active&department=Engineering&page=1&limit=20
 * @access  Private (company_admin, hr)
 */
export const listEmployees = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = resolveCompanyScope(req);
    if (!company) {
      return next(new ErrorHandler("company is required", 400));
    }

    const { status, department, search } = req.query as {
      status?: string;
      department?: string;
      search?: string;
    };
    const page = Math.max(
      parseInt((req.query.page as string) || "1", 10) || 1,
      1,
    );
    const limit = Math.min(
      parseInt((req.query.limit as string) || "20", 10) || 20,
      100,
    );

    const filter: Record<string, unknown> = { company };
    if (status) filter.employmentStatus = status;
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Employee.countDocuments(filter),
    ]);

    res.json({
      success: true,
      employees,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  },
);

/**
 * @desc    Get a single employee (must belong to caller's company)
 * @route   GET /api/employees/:id
 * @access  Private (company_admin, hr, or the employee themself)
 */
export const getEmployee = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = resolveCompanyScope(req);

    const employee = await Employee.findOne({ _id: req.params.id, company });
    if (!employee) {
      return next(new ErrorHandler("Employee not found", 404));
    }

    // Employees may only view their own record
    if (
      req.user!.role === "employee" &&
      req.user!.employee?.toString() !== employee._id.toString()
    ) {
      return next(new ErrorHandler("Not authorized to view this record", 403));
    }

    res.json({ success: true, employee });
  },
);
/**
 * @desc    Update an employee
 * @route   PUT /api/employees/:id
 * @access  Private (company_admin, hr)
 */
export const updateEmployee = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = resolveCompanyScope(req);

    const employee = await Employee.findOne({ _id: req.params.id, company });
    if (!employee) {
      return next(new ErrorHandler("Employee not found", 404));
    }

    // company and employeeId are immutable via this route to avoid accidental
    // cross-tenant reassignment or ID collisions
    const { company: _c, employeeId: _e, ...updatableFields } = req.body;

    Object.assign(employee, updatableFields);
    const updated = await employee.save();
    res.json({ success: true, employee: updated });
  },
);

/**
 * @desc    Soft-delete (offboard) an employee rather than hard-deleting,
 *          since historical payslips must remain valid for audits.
 * @route   DELETE /api/employees/:id
 * @access  Private (company_admin only)
 */
export const deactivateEmployee = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = resolveCompanyScope(req);

    const employee = await Employee.findOne({ _id: req.params.id, company });
    if (!employee) {
      return next(new ErrorHandler("Employee not found", 404));
    }

    employee.employmentStatus = "terminated";
    await employee.save();

    res.json({ message: "Employee marked as terminated", id: employee._id });
  },
);
