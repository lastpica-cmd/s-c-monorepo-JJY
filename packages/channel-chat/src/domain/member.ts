export type MemberId = string;

export type Member = {
  id: MemberId;
  displayName: string;
  role: "owner" | "member";
  presence: "online" | "away" | "offline";
  avatarInitials: string;
};
