#!/usr/bin/env zsh

# 获取今天的提交哈希值
commits=$(git log --since="00:00" --pretty=format:"%H")

# 初始化两个关联数组来存储文件及其更改的行数
typeset -A file_changes_today
typeset -A file_changes_diff

# 对于每个提交
while read -r commit; do
    # 获取每个文件的更改行数
    while read -r added removed file; do
        # 更新今天内的文件更改行数
        file_changes_today["$file"]=$((file_changes_today["$file"] + added + removed))
    done < <(git show --numstat "$commit" | grep -E '^[0-9]+')
done <<< "$commits"

# 获取今天开始前的最后一个版本
last_commit_before_today=$(git log --before="00:00" -1 --pretty=format:"%H")

# 获取每个文件的差异行数
while read -r added removed file; do
    # 更新文件的差异行数
    file_changes_diff["$file"]=$((added + removed))
done < <(git diff --numstat "$last_commit_before_today" HEAD | grep -E '^[0-9]+')


# 输出文件的更改行数
echo -e "\e[1;34mFile\t\t\t\t\t\t\t\tLines Changed Today\t\t\tDiff Lines\e[0m"
echo "-----------------------------------------------------------------------------------------------------------------------"

# 初始化变量以计算总行数
total_lines_changed_today=0
total_diff_lines=0

# 获取所有涉及的文件
all_files=(${(k)file_changes_today} ${(@k)file_changes_diff})
unique_files=(${(u)all_files})

# 对文件名进行排序
sorted_files=($(printf "%s\n" "${unique_files[@]}" | sort))

# 按排序后的顺序打印文件及其更改行数
for file in "${sorted_files[@]}"; do
    lines_changed_today=${file_changes_today[$file]}
    diff_lines=${file_changes_diff[$file]}
    printf "\e[32m%-80s\e[0m \e[33m%4d\e[0m\t\t\t\t\e[33m%4d\e[0m\n" "$file:" "$lines_changed_today" "$diff_lines"
    # 累加到总行数
    total_lines_changed_today=$((total_lines_changed_today + lines_changed_today))
    total_diff_lines=$((total_diff_lines + diff_lines))
done

# 输出总行数
echo "-----------------------------------------------------------------------------------------------------------------------"
printf "Total Count\t\t\t\t\t\t\t\t\t\e[33m%4d\e[0m\t\t\t\t\e[33m%4d\e[0m\n" "$total_lines_changed_today" "$total_diff_lines"
