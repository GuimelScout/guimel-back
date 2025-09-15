import { KeystoneContext } from "@keystone-6/core/types";
import { createUserAdmin } from "./user";
import { createRoles } from "./roles";
import { createLocations } from "./location";
import { createActivities } from "./activity";
import { createLodging } from "./lodging";
import { createLodgingIncludes } from "./lodgingInclude";
import { createActivityIncludes } from "./activityInclude";
import { createActivityWhatToDo } from "./activityWhatToDo";

export default async function seed(context: KeystoneContext) {
  console.log("🌱 Starting database seeding...");
  
  // Create roles first
  const roles = await createRoles(context);
  
  // Create default admin user
  const userID = await createUserAdmin(context, roles);
  
  // Create sample locations
  const locations = await createLocations(context);
  
  // Create activities related to locations
  const activities = await createActivities(context, locations as any[]);
  
  // Create lodging related to activities and locations
  const lodging = await createLodging(context, activities as any[], locations as any[]);
  
  // Create lodging includes and assign them to lodging
  const lodgingIncludes = await createLodgingIncludes(context, lodging as any[]);
  
  // Create activity includes and assign them to activities
  const activityIncludes = await createActivityIncludes(context, activities as any[]);
  
  // Create activity what to do and assign them to activities
  const activityWhatToDo = await createActivityWhatToDo(context, activities as any[]);
  
  console.log("✅ Database seeding completed successfully!");
}
