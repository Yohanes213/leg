import streamlit as st
import pandas as pd
from app import get_all_template_data, update_specific_template_data


def update_template_data(original_df, changes):
    for index, row in changes.iterrows():
                    original_row = original_df.loc[index]
                    changed_fields = {}
                    for column in row.index:
                        if row[column] != original_row[column]:
                            changed_fields[column] = row[column]
                    
                    if changed_fields:
                        print(index)
                        # print(original_df.loc[index])
                        # print(row['id'])
                        # print(changed_fields)
                        
                        print(update_specific_template_data("DocumentTemplate", row['id'], changed_fields))

def main():
    st.markdown("""
    <style>
    .main .block-container {
        max-width: 100% !important;
        padding-left: 5% !important;
        padding-right: 5% !important;
    }
    .stDataFrame {
        width: 100% !important;
    }
    .stDataFrame > div {
        width: 100% !important;
    }
    </style>
    """, unsafe_allow_html=True)

    st.title("Streamlit App with Sidebar and Editable Table")

    # Sidebar
    st.sidebar.header("Sidebar")
    sidebar_option = st.sidebar.selectbox(
        "Choose an option:",
        ["Civil", "Option 2", "Option 3"]
    )
    st.sidebar.write(f"You selected: {sidebar_option}")

    result = get_all_template_data("DocumentTemplate")
    documents = result["data"]["Get"]["DocumentTemplate"]

    # Create lists to hold the data
    ids = []
    texts = []
    details = []

    # Loop through each document and extract the required fields
    for doc in documents:
        ids.append(doc["_additional"]["id"])
        details.append(doc["detail"])
        texts.append(doc["text"])

    # Create a DataFrame
    df = pd.DataFrame({
        "id": ids,
        "detail": details,
        "text": texts
    })

    # Store the original dataframe in session state
    if 'original_df' not in st.session_state:
        st.session_state.original_df = df.copy()
    
    if 'show_changes' not in st.session_state:
        st.session_state.show_changes = False

    

    if 'button_text' not in st.session_state:
        st.session_state.button_text = "Update"
    
    if 'changes' not in st.session_state:
        st.session_state.changes = None
    
    # button_clicked = st.button(st.session_state.button_text)
    if st.session_state.show_changes:
        st.warning("Please make sure the changes made are the following and press confirm below:")
    
    if 'hide_table' not in st.session_state:
        st.session_state.hide_table = False
    

    # if st.session_state.show_changes:
    #     st.warning("Please make sure the changes made are the following and press confirm:")
        
    if st.button(st.session_state.button_text):
        if st.session_state.button_text == "Update":
            changed_rows = st.session_state.edited_df[~(st.session_state.edited_df == st.session_state.original_df).all(axis=1)]
            if not changed_rows.empty:
                st.session_state.changes = changed_rows
                st.session_state.button_text = "Confirm"
                st.session_state.show_changes = True
                st.session_state.hide_table = True
                
                st.rerun()
            # st.session_state.changed = edited_df.compare(st.session_state.original_df)
            # if not st.session_state.changes.empty:
            #     st.session_state.button_text = "Confirm"
            #     st.rerun()
        else:  # Confirm action
            # Perform update logic here
            # ...

            # st.session_state.original_df = edited_df.copy()
            update_template_data(st.session_state.original_df, st.session_state.changes)
            st.session_state.original_df = st.session_state.edited_df.copy()
            st.session_state.changes = None
            st.session_state.button_text = "Update"
            st.session_state.show_changes = False
            st.session_state.hide_table = False
            st.rerun()
            # st.success("Data updated successfully!")
    
    if not st.session_state.hide_table:
        with st.container():
            columns_to_display = ['detail', 'text']
            edited_df = st.data_editor(df, use_container_width=True, height=600,column_order=columns_to_display
                                    #    ,column_config={
                # "id": st.column_config.Column(disabled=True),
                # "column_to_hide_2": st.column_config.Column(disabled=True),
                # Add more columns you want to hide
            # }
            )
            st.session_state.edited_df = edited_df

    

    changes_placeholder = st.empty()

    # Display the editable table
    # st.markdown("""
    # <style>
    # .stDataFrame {
    #     width: 100vw;
    #     margin-left: calc(-50vw + 50%);
    # }
    # .stDataFrame > div {
    #     width: 100%;
    #     max-width: none;
    # }
    # </style>
    # """, unsafe_allow_html=True)

    

    # changes = edited_df.compare(st.session_state.original_df)

    if st.session_state.changes is not None and not st.session_state.changes.empty:
        changes_placeholder.subheader("Changes:")
        columns_to_display = ['detail', 'text']  # Add or remove columns as needed
        changes_to_display = st.session_state.changes[columns_to_display]
        changes_placeholder.write(changes_to_display)
        # changes_placeholder.write(st.session_state.changes)
    
    # if not changes.empty:
    #     print("confirm")
    #     st.session_state.button_text = "Confirm"
    # else:
    #     print("update")
    #     st.session_state.button_text = "Update"
    
    # Check if the "Update" button is clicked
    # if st.button("Update"):
    #     print("clicked update")
    #     # Compare the original DataFrame with the edited DataFrame
    #     changes = edited_df.compare(st.session_state.original_df)
    #     print(changes)
    #     if not changes.empty:
    #         # Loop through each changed row
    #         for index, row in changes.iterrows():
    #             updated_id = st.session_state.original_df.loc[index, 'id']
    #             update_data = {}

    #             for column in ['detail', 'text']:
    #                 if column in changes.columns:
    #                     # Check if the value has actually changed
    #                     if changes.loc[index, (column, 'self')] != changes.loc[index, (column, 'other')]:
    #                         update_data[column] = edited_df.loc[index, column]
    #             print(index)
    #             print("*************************************")
    #             print(update_data)
    #             # Update the specific template data using the updated values
    #             # update_specific_template_data("DocumentTemplate", updated_id, updated_detail, updated_text)

    #         # Update the original dataframe in session state
    #         st.session_state.original_df = edited_df.copy()

    #         # Display a success message
    #         st.success("Data updated successfully!")
    #     else:
    #         st.info("No changes detected.")

    #     # Display the changes
    #     st.subheader("Changes:")
    #     st.write(changes)
    # if button_clicked:
    #     print("button clicked")
    #     if st.session_state.button_text == "Confirm":
    #         print("confirm button")
    #         st.session_state.button_text = "Update"
    #         st.info("Confirm button clicked")
    #     else:
    #         print("update button")
    #         # Compare the original DataFrame with the edited DataFrame
    #         changes = edited_df.compare(st.session_state.original_df)
    #         print("changes done")
    #         if not changes.empty:
    #             print("inside changes.empty")
    #             # Update logic (keep the existing code for updating data)

    #             # Update the original dataframe in session state
    #             st.session_state.original_df = edited_df.copy()

    #             # Display a success message
    #             st.success("Data updated successfully!")

    #             # Display the changes above the main table
    #             changes_placeholder.subheader("Changes:")
    #             changes_placeholder.write(changes)
    #             st.session_state.button_text = "Confirm"
    #         else:
    #             print("inside else")
    #             changes_placeholder.info("No changes detected.")


if __name__ == "__main__":
    main()