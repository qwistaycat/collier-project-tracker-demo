import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import { FUNCTIONAL_CATEGORIES, DEPARTMENTS } from "../data/proposals";

interface FiltersProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  selectedDepartment: string | null;
  onSelectDepartment: (department: string | null) => void;
  sortBy: string;
  onSelectSortBy: (sort: string) => void;
  includeArchived: boolean;
  onToggleIncludeArchived: (val: boolean) => void;
}

const SORT_OPTIONS = [
  { label: "Newest First", value: "Newest First" },
  { label: "Deadline Approaching", value: "Deadline Approaching" },
  { label: "Most Discussed", value: "Most Discussed" },
  { label: "Most Viewed", value: "Most Viewed" },
];

export default function Filters({
  selectedCategory,
  onSelectCategory,
  selectedDepartment,
  onSelectDepartment,
  sortBy,
  onSelectSortBy,
  includeArchived,
  onToggleIncludeArchived,
}: FiltersProps) {
  // Track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState<"sort" | "category" | "department" | null>(null);

  const toggleDropdown = (dropdown: "sort" | "category" | "department") => {
    if (openDropdown === dropdown) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(dropdown);
    }
  };

  console.log("Rendering Filters Component", {
    selectedCategory,
    selectedDepartment,
    sortBy,
    includeArchived,
  });

  return (
    <View style={styles.container}>
      {/* 1. Sort By Dropdown */}
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => toggleDropdown("sort")}
        >
          <Text style={styles.selectText}>
            {sortBy ? sortBy : "Sort By"}
          </Text>
          <Text style={styles.chevron}>{openDropdown === "sort" ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {openDropdown === "sort" && (
          <View style={styles.optionsList}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                onSelectSortBy("");
                setOpenDropdown(null);
              }}
            >
              <Text style={styles.optionTextPlaceholder}>Sort By</Text>
            </TouchableOpacity>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionItem,
                  sortBy === opt.value && styles.activeOptionItem,
                ]}
                onPress={() => {
                  onSelectSortBy(opt.value);
                  setOpenDropdown(null);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    sortBy === opt.value && styles.activeOptionText,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 2. Filter Category Dropdown */}
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => toggleDropdown("category")}
        >
          <Text style={styles.selectText}>
            {selectedCategory ? selectedCategory : "All Categories"}
          </Text>
          <Text style={styles.chevron}>{openDropdown === "category" ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {openDropdown === "category" && (
          <View style={styles.optionsList}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                onSelectCategory(null);
                setOpenDropdown(null);
              }}
            >
              <Text style={styles.optionTextPlaceholder}>All Categories</Text>
            </TouchableOpacity>
            {FUNCTIONAL_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.optionItem,
                  selectedCategory === cat && styles.activeOptionItem,
                ]}
                onPress={() => {
                  onSelectCategory(cat);
                  setOpenDropdown(null);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedCategory === cat && styles.activeOptionText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 3. Filter by Department Dropdown */}
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => toggleDropdown("department")}
        >
          <Text style={styles.selectText}>
            {selectedDepartment ? selectedDepartment : "All Departments"}
          </Text>
          <Text style={styles.chevron}>{openDropdown === "department" ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {openDropdown === "department" && (
          <View style={styles.optionsList}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                onSelectDepartment(null);
                setOpenDropdown(null);
              }}
            >
              <Text style={styles.optionTextPlaceholder}>All Departments</Text>
            </TouchableOpacity>
            {DEPARTMENTS.map((dept) => (
              <TouchableOpacity
                key={dept}
                style={[
                  styles.optionItem,
                  selectedDepartment === dept && styles.activeOptionItem,
                ]}
                onPress={() => {
                  onSelectDepartment(dept);
                  setOpenDropdown(null);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedDepartment === dept && styles.activeOptionText,
                  ]}
                >
                  {dept}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 4. Archived Checkbox (Switch) */}
      <TouchableOpacity
        style={styles.checkboxRow}
        activeOpacity={0.8}
        onPress={() => onToggleIncludeArchived(!includeArchived)}
      >
        <Switch
          trackColor={{ false: "#e5e7eb", true: "#bfdbfe" }}
          thumbColor={includeArchived ? "#2563eb" : "#f3f4f6"}
          value={includeArchived}
          onValueChange={onToggleIncludeArchived}
        />
        <Text style={styles.checkboxLabel}>Include Archived</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    gap: 12,
  },
  dropdownWrapper: {
    position: "relative",
    zIndex: 10,
  },
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#4b5563",
  },
  chevron: {
    fontSize: 10,
    color: "#9ca3af",
  },
  optionsList: {
    marginTop: 4,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 200,
    overflow: "scroll",
  },
  optionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  activeOptionItem: {
    backgroundColor: "#eff6ff",
  },
  optionTextPlaceholder: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#9ca3af",
  },
  optionText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#111827",
  },
  activeOptionText: {
    fontFamily: "Poppins_500Medium",
    color: "#2563eb",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    paddingVertical: 4,
  },
  checkboxLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#4b5563",
  },
});
