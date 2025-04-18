export enum Role {
  ADMIN = "admin",
  HOSTER = "hoster",
  USER = "user",
}

export const role_options = [
  { label: "Admin", value: Role.ADMIN },
  { label: "Anfitrión", value: Role.HOSTER },
  { label: "Usuario", value: Role.USER },
];

export const rolesDB = [
  { name: Role.ADMIN },
  { name: Role.HOSTER },
  { name: Role.USER },

];
