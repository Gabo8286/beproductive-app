import SwiftUI
import SwiftUI
import SwiftData
import BeProductiveUI
import Foundation

// Avoid naming conflict with Swift concurrency Task when we need to use it
typealias ConcurrentTask<Success, Failure: Error> = _Concurrency.Task<Success, Failure>

struct TaskEditView: View {
    @Bindable var taskModel: Task
    @ObservedObject var viewModel: TaskViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var newTag: String = ""

    @State private var showingDatePicker = false
    @State private var isSaving = false
    @State private var showingError = false
    @State private var errorMessage = ""

    init(task: Task, viewModel: TaskViewModel) {
        self.taskModel = task
        self.viewModel = viewModel
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: BPSpacing.lg) {
                    // Basic Information Section
                    BasicInfoSection(taskModel: taskModel)

                    // Priority Section
                    PrioritySection(priority: $taskModel.priority)

                    // Due Date Section
                    DueDateSection(
                        taskModel: taskModel,
                        showingDatePicker: $showingDatePicker
                    )

                    // Time Estimation Section
                    TimeEstimationSection(estimatedDuration: $taskModel.estimatedDuration)

                    // Tags Section
                    TagsSection(tags: $taskModel.tags, newTag: $newTag)

                    Spacer(minLength: 100)
                }
                .padding(.horizontal, BPSpacing.md)
            }
            .navigationTitle("Edit Task")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveTask()
                    }
                    .disabled(isSaving)
                }
            }
        }
        .sheet(isPresented: $showingDatePicker) {
            DatePickerSheet(
                date: Binding(
                    get: { taskModel.dueDate ?? Date() },
                    set: { taskModel.dueDate = $0 }
                ), 
                title: "Due Date"
            )
        }
        .alert("Error", isPresented: $showingError) {
            Button("OK") {}
        } message: {
            Text(errorMessage)
        }
        .disabled(isSaving)
    }

    private func saveTask() {
        guard !taskModel.title.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines).isEmpty else {
            errorMessage = "Task title cannot be empty"
            showingError = true
            return
        }

        isSaving = true

        ConcurrentTask { @MainActor in
            do {
                // Trim the title
                taskModel.title = taskModel.title.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines)

                try await viewModel.updateTask(taskModel)

                isSaving = false
                dismiss()
            } catch {
                isSaving = false
                errorMessage = error.localizedDescription
                showingError = true
            }
        }
    }
}

struct BasicInfoSection: View {
    @Bindable var taskModel: Task
    
    private var description: String {
        get { taskModel.taskDescription ?? "" }
        nonmutating set { 
            taskModel.taskDescription = newValue.isEmpty ? nil : newValue 
        }
    }
    
    private var category: String {
        get { taskModel.category ?? "" }
        nonmutating set { 
            taskModel.category = newValue.isEmpty ? nil : newValue 
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            BPText("Basic Information", style: .sectionTitle)
                .foregroundColor(BPColors.Text.primary)

            VStack(spacing: BPSpacing.md) {
                BPTextField(
                    placeholder: "Task title",
                    text: $taskModel.title
                )

                BPTextField(
                    placeholder: "Description (optional)",
                    text: Binding(
                        get: { description },
                        set: { description = $0 }
                    ),
                    inputType: .multiline()
                )

                BPTextField(
                    placeholder: "Category (optional)",
                    text: Binding(
                        get: { category },
                        set: { category = $0 }
                    )
                )
            }
        }
        .bpCard()
    }
}

struct PrioritySection: View {
    @Binding var priority: TaskPriorityLevel
    
    private let priorities: [TaskPriorityLevel] = [.low, .medium, .high, .urgent]

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            BPText("Priority", style: .sectionTitle)
                .foregroundColor(BPColors.Text.primary)

            HStack(spacing: BPSpacing.sm) {
                ForEach(priorities, id: \.self) { priorityOption in
                    BPButton(
                        priorityOption.displayName,
                        style: priority == priorityOption ? .primary : .secondary,
                        size: .small
                    ) {
                        priority = priorityOption
                    }
                }
            }
        }
        .bpCard()
    }
}

struct DueDateSection: View {
    @Bindable var taskModel: Task
    @Binding var showingDatePicker: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            BPText("Due Date", style: .sectionTitle)
                .foregroundColor(BPColors.Text.primary)

            VStack(spacing: BPSpacing.sm) {
                HStack {
                    Toggle("Set due date", isOn: Binding(
                        get: { taskModel.dueDate != nil },
                        set: { newValue in
                            if !newValue {
                                taskModel.dueDate = nil
                            } else if taskModel.dueDate == nil {
                                taskModel.dueDate = Date()
                            }
                        }
                    ))
                        .tint(BPColors.Primary.main)

                    Spacer()
                }

                if taskModel.dueDate != nil {
                    Button(action: {
                        showingDatePicker = true
                    }) {
                        HStack {
                            Image(systemName: "calendar")
                                .foregroundColor(BPColors.Primary.main)

                            BPText(formatDate(taskModel.dueDate ?? Date()), style: .bodyMedium)
                                .foregroundColor(BPColors.Text.primary)

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(BPColors.Text.secondary)
                        }
                        .padding(.vertical, BPSpacing.sm)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
        }
        .bpCard()
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .full
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

struct TimeEstimationSection: View {
    @Binding var estimatedDuration: TimeInterval?
    @State private var hasEstimation = false
    @State private var hours: Int = 0
    @State private var minutes: Int = 0

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            BPText("Time Estimation", style: .sectionTitle)
                .foregroundColor(BPColors.Text.primary)

            VStack(spacing: BPSpacing.sm) {
                HStack {
                    Toggle("Estimate time needed", isOn: $hasEstimation)
                        .tint(BPColors.Primary.main)

                    Spacer()
                }

                if hasEstimation {
                    HStack(spacing: BPSpacing.md) {
                        VStack {
                            BPText("Hours", style: .labelMedium)
                                .foregroundColor(BPColors.Text.secondary)

                            Picker("Hours", selection: $hours) {
                                ForEach(0..<24) { hour in
                                    Text("\(hour)").tag(hour)
                                }
                            }
                            .pickerStyle(WheelPickerStyle())
                            .frame(height: 80)
                        }

                        VStack {
                            BPText("Minutes", style: .labelMedium)
                                .foregroundColor(BPColors.Text.secondary)

                            Picker("Minutes", selection: $minutes) {
                                ForEach([0, 15, 30, 45], id: \.self) { minute in
                                    Text("\(minute)").tag(minute)
                                }
                            }
                            .pickerStyle(WheelPickerStyle())
                            .frame(height: 80)
                        }
                    }
                }
            }
        }
        .bpCard()
        .onAppear {
            if let duration = estimatedDuration {
                hasEstimation = true
                hours = Int(duration / 3600)
                minutes = Int((duration.truncatingRemainder(dividingBy: 3600)) / 60)
            }
        }
        .onChange(of: hasEstimation) {
            if hasEstimation {
                estimatedDuration = TimeInterval(hours * 3600 + minutes * 60)
            } else {
                estimatedDuration = nil
            }
        }
        .onChange(of: hours) {
            if hasEstimation {
                estimatedDuration = TimeInterval(hours * 3600 + minutes * 60)
            }
        }
        .onChange(of: minutes) {
            if hasEstimation {
                estimatedDuration = TimeInterval(hours * 3600 + minutes * 60)
            }
        }
    }
}

struct TagsSection: View {
    @Binding var tags: [String]
    @Binding var newTag: String

    var body: some View {
        VStack(alignment: .leading, spacing: BPSpacing.md) {
            BPText("Tags", style: .sectionTitle)
                .foregroundColor(BPColors.Text.primary)

            VStack(spacing: BPSpacing.sm) {
                HStack {
                    BPTextField(
                        placeholder: "Add a tag",
                        text: $newTag
                    )

                    BPButton(
                        "Add",
                        style: .primary,
                        size: .small
                    ) {
                        addTag()
                    }
                    .disabled(newTag.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines).isEmpty)
                }

                if !tags.isEmpty {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: BPSpacing.xs) {
                        ForEach(tags, id: \.self) { tag in
                            TagChip(tag: tag) {
                                removeTag(tag)
                            }
                        }
                    }
                }
            }
        }
        .bpCard()
    }

    private func addTag() {
        let trimmedTag = newTag.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines)
        if !trimmedTag.isEmpty && !tags.contains(trimmedTag) {
            tags.append(trimmedTag)
            newTag = ""
        }
    }

    private func removeTag(_ tag: String) {
        tags.removeAll { $0 == tag }
    }
}

struct TagChip: View {
    let tag: String
    let onRemove: () -> Void

    var body: some View {
        HStack(spacing: BPSpacing.xs) {
            BPText(tag, style: .labelMedium)
                .foregroundColor(BPColors.Primary.main)

            Button(action: onRemove) {
                Image(systemName: "xmark.circle.fill")
                    .font(.caption)
                    .foregroundColor(BPColors.Text.secondary)
            }
        }
        .padding(.horizontal, BPSpacing.sm)
        .padding(.vertical, BPSpacing.xs)
        .background(BPColors.Primary.main.opacity(0.1))
        .cornerRadius(BPSpacing.sm)
    }
}

struct DatePickerSheet: View {
    @Binding var date: Date
    let title: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            VStack {
                DatePicker(
                    title,
                    selection: $date,
                    displayedComponents: [.date, .hourAndMinute]
                )
                .datePickerStyle(WheelDatePickerStyle())
                .padding()

                Spacer()
            }
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct AddSubtaskView: View {
    let parentTask: Task
    @ObservedObject var viewModel: TaskViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var isSaving = false

    var body: some View {
        NavigationView {
            VStack(spacing: BPSpacing.lg) {
                BPTextField(
                    placeholder: "Subtask title",
                    text: $title
                )
                .padding(.horizontal, BPSpacing.md)

                Spacer()
            }
            .padding(.top, BPSpacing.lg)
            .navigationTitle("Add Subtask")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        addSubtask()
                    }
                    .disabled(title.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines).isEmpty)
                }
            }
        }
        .disabled(isSaving)
    }

    private func addSubtask() {
        guard !title.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines).isEmpty else { return }

        isSaving = true
        
        let trimmedTitle = title.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines)

        ConcurrentTask { @MainActor in
            do {
                try await viewModel.addSubtask(to: parentTask, title: trimmedTitle)
                isSaving = false
                dismiss()
            } catch {
                isSaving = false
                // Handle error
            }
        }
    }
}

#Preview {
    // Create a sample task using the Task model
    let sampleTask = Task(
        title: "Sample Task",
        taskDescription: "This is a sample task",
        priority: TaskPriorityLevel.medium,
        category: "Work",
        userId: UUID()
    )
    
    // Set additional properties after initialization
    sampleTask.dueDate = Date()

    return TaskEditView(task: sampleTask, viewModel: TaskViewModel(dataManager: DataManager()))
        .environmentObject(BPThemeManager.shared)
}
